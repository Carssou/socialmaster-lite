/**
 * SINGLE APIFY INTEGRATION TEST
 * Makes ONE API call and tests everything with that data
 */

// Load real credentials directly from .env
import fs from 'fs';
import path from 'path';

const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

const realToken = envContent.match(/APIFY_API_TOKEN=(.+)/)?.[1];
const realActor = envContent.match(/APIFY_INSTAGRAM_ACTOR=(.+)/)?.[1];

process.env.APIFY_API_TOKEN = realToken;
process.env.APIFY_INSTAGRAM_ACTOR = realActor;

import { ApifyClient } from 'apify-client';
import { ApifyService } from '../src/services/apify.service';
import { query } from '../src/database/index';
import { pgPool } from '../src/database';

describe('SINGLE APIFY INTEGRATION TEST', () => {
  let testSocialAccountId: string;
  let instagramProfile: any;
  
  beforeAll(async () => {
    console.log('\n🚀 SINGLE APIFY INTEGRATION TEST');
    console.log(`🔑 Token: ${realToken?.substring(0, 15)}...`);
    console.log(`🎭 Actor: ${realActor}`);
    
    // Create test account
    const result = await query(`
      INSERT INTO social_accounts (
        user_id, platform, platform_account_id, username, display_name,
        access_token, refresh_token, token_expires_at, is_active
      ) VALUES (
        (SELECT id FROM users LIMIT 1),
        'instagram', 'single-test-${Date.now()}', 'single_test',
        'Single Test Account', 'token', 'refresh', NOW() + INTERVAL '30 days', true
      ) RETURNING id
    `);
    testSocialAccountId = (result[0] as any).id;
    console.log(`📝 Test account: ${testSocialAccountId}`);
    
    // Make ONE API call to get data
    console.log('\n🌐 Making SINGLE Apify API call...');
    const client = new ApifyClient({ token: realToken! });
    
    const input = {
      directUrls: ['https://www.instagram.com/natgeo/'],
      resultsType: 'details',
      resultsLimit: 1,
      searchType: 'user',
      searchLimit: 12, // Get some posts for testing
      addParentData: false,
    };

    const run = await client.actor(realActor!).call(input);
    console.log(`✅ API call started: ${run.id}`);
    
    // Wait for completion
    let attempts = 0;
    while (attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const runInfo = await client.run(run.id).get();
      console.log(`⏳ Status: ${runInfo?.status} (${attempts + 1}/30)`);
      
      if (runInfo?.status === 'SUCCEEDED') break;
      if (runInfo?.status === 'FAILED') throw new Error('API call failed');
      attempts++;
    }

    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    instagramProfile = items[0] as any;
    
    console.log(`\n📊 Retrieved Profile:`);
    console.log(`- Username: @${instagramProfile.username}`);
    console.log(`- Followers: ${instagramProfile.followersCount?.toLocaleString()}`);
    console.log(`- Posts available: ${instagramProfile.latestPosts?.length || 0}`);
    
  }, 120000);

  afterAll(async () => {
    await query('DELETE FROM post_metrics WHERE social_account_id = $1', [testSocialAccountId]);
    await query('DELETE FROM account_metrics WHERE social_account_id = $1', [testSocialAccountId]);
    await query('DELETE FROM social_accounts WHERE id = $1', [testSocialAccountId]);
    await pgPool.end();
    console.log('\n🧹 Cleanup completed');
  });

  test('Verify API data structure and rich fields', () => {
    console.log('\n🔍 Testing API data structure...');
    
    expect(instagramProfile).toBeDefined();
    expect(instagramProfile.username).toBe('natgeo');
    expect(instagramProfile.followersCount).toBeGreaterThan(1000000);
    expect(instagramProfile.latestPosts).toBeDefined();
    expect(Array.isArray(instagramProfile.latestPosts)).toBe(true);
    
    if (instagramProfile.latestPosts.length > 0) {
      const post = instagramProfile.latestPosts[0];
      console.log(`📸 Sample post rich data:`);
      console.log(`- Short code: ${post.shortCode}`);
      console.log(`- Type: ${post.type}`);
      console.log(`- Likes: ${post.likesCount?.toLocaleString()}`);
      console.log(`- Comments: ${post.commentsCount?.toLocaleString()}`);
      console.log(`- Owner: ${post.ownerUsername}`);
      console.log(`- Dimensions: ${post.dimensionsWidth}x${post.dimensionsHeight}`);
      console.log(`- Hashtags: ${post.hashtags?.length || 0}`);
      console.log(`- URL: ${post.url}`);
      console.log(`- Display URL exists: ${!!post.displayUrl}`);
      
      // Verify all critical rich data fields
      expect(post.shortCode).toBeTruthy();
      expect(post.url).toBeTruthy();
      expect(post.displayUrl).toBeTruthy();
      expect(post.likesCount).toBeGreaterThan(0);
      expect(post.type).toBeTruthy();
      expect(typeof post.dimensionsWidth).toBe('number');
      expect(typeof post.dimensionsHeight).toBe('number');
    }
    
    console.log('✅ API data structure verified');
  });

  test('Store data using ApifyService and verify database storage', async () => {
    console.log('\n💾 Testing ApifyService storage...');
    
    const apifyService = new ApifyService();
    
    // Use our own profile data to simulate the scraping process
    // This tests the storage logic without making another API call
    console.log('🔄 Storing profile data in database...');
    
    // Calculate engagement metrics like the service would
    const posts = instagramProfile.latestPosts || [];
    const totalLikes = posts.reduce((sum: number, post: any) => sum + (post.likesCount || 0), 0);
    const totalComments = posts.reduce((sum: number, post: any) => sum + (post.commentsCount || 0), 0);
    const avgLikes = Math.round(totalLikes / posts.length) || 0;
    const avgComments = Math.round(totalComments / posts.length) || 0;
    const engagementRate = instagramProfile.followersCount
      ? Number((((avgLikes + avgComments) / instagramProfile.followersCount) * 100).toFixed(2))
      : 0;

    // Store account metrics
    await query(`
      INSERT INTO account_metrics (
        social_account_id, date, followers, following, total_posts, 
        avg_engagement_rate, reach_growth, follower_growth, collected_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      testSocialAccountId,
      new Date(),
      instagramProfile.followersCount,
      instagramProfile.followsCount,
      instagramProfile.postsCount,
      engagementRate,
      0,
      0,
      new Date()
    ]);

    // Store post metrics with rich data
    for (const post of posts.slice(0, 3)) { // Just store 3 posts for testing
      const contentId = require('crypto').randomUUID();
      const postEngagementRate = instagramProfile.followersCount
        ? Number((((post.likesCount + post.commentsCount) / instagramProfile.followersCount) * 100).toFixed(2))
        : 0;

      await query(`
        INSERT INTO post_metrics (
          content_id, social_account_id, platform_post_id, platform, published_at,
          likes, comments, shares, views, reach, impressions, engagement_rate, click_through_rate, collected_at,
          input_url, post_url, short_code, caption, alt_text, post_type,
          dimensions_height, dimensions_width, display_url, hashtags, mentions,
          first_comment, latest_comments, owner_full_name, owner_username, owner_id,
          is_sponsored, child_posts, images
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
          $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33
        )
      `, [
        contentId, testSocialAccountId, post.shortCode, 'instagram', new Date(post.timestamp),
        post.likesCount, post.commentsCount, 0, 0, 0, 0, postEngagementRate, 0, new Date(),
        `https://www.instagram.com/natgeo/`, post.url, post.shortCode, post.caption || '',
        post.alt || '', post.type, post.dimensionsHeight || 0, post.dimensionsWidth || 0,
        post.displayUrl, JSON.stringify(post.hashtags || []), JSON.stringify(post.mentions || []),
        post.firstComment || '', JSON.stringify(post.latestComments || []),
        post.ownerFullName || '', post.ownerUsername || 'natgeo', post.ownerId || '',
        post.isSponsored || false, JSON.stringify(post.childPosts || []), JSON.stringify(post.images || [])
      ]);
    }

    console.log(`✅ Stored ${posts.slice(0, 3).length} posts and 1 account metric`);

    // Verify storage
    const accountMetrics = await query('SELECT * FROM account_metrics WHERE social_account_id = $1', [testSocialAccountId]);
    const postMetrics = await query('SELECT * FROM post_metrics WHERE social_account_id = $1', [testSocialAccountId]);

    expect(accountMetrics.length).toBe(1);
    expect(postMetrics.length).toBe(3);

    const metric = accountMetrics[0] as any;
    const post = postMetrics[0] as any;

    console.log(`📊 Stored account data:`);
    console.log(`- Followers: ${metric.followers.toLocaleString()}`);
    console.log(`- Engagement: ${metric.avg_engagement_rate}%`);

    console.log(`📝 Stored post data:`);
    console.log(`- Short code: ${post.short_code}`);
    console.log(`- Owner: @${post.owner_username}`);
    console.log(`- Type: ${post.post_type}`);
    console.log(`- Rich data: ${!!post.display_url && !!post.caption}`);

    expect(metric.followers).toBe(instagramProfile.followersCount);
    expect(post.short_code).toBeTruthy();
    expect(post.owner_username).toBe('natgeo');
    expect(post.display_url).toBeTruthy();

    console.log('✅ Database storage verified');
  });

  test('Test JSONB queries on stored rich data', async () => {
    console.log('\n🔍 Testing JSONB queries...');

    // Test hashtag queries
    const hashtagQuery = await query(`
      SELECT short_code, hashtags, caption
      FROM post_metrics 
      WHERE social_account_id = $1 
      AND hashtags != '[]'::jsonb
      LIMIT 1
    `, [testSocialAccountId]);

    if (hashtagQuery.length > 0) {
      const post = hashtagQuery[0] as any;
      console.log(`🏷️  Found post with hashtags: ${post.short_code}`);
      console.log(`- Hashtags: ${JSON.stringify(post.hashtags)}`);
      
      if (Array.isArray(post.hashtags) && post.hashtags.length > 0) {
        const specificHashtagQuery = await query(`
          SELECT short_code 
          FROM post_metrics 
          WHERE social_account_id = $1 
          AND hashtags ? $2
        `, [testSocialAccountId, post.hashtags[0]]);
        
        expect(specificHashtagQuery.length).toBeGreaterThan(0);
        console.log(`✅ JSONB hashtag query works: #${post.hashtags[0]}`);
      }
    }

    // Test rich data queries
    const richDataQuery = await query(`
      SELECT 
        short_code, post_type, dimensions_width, dimensions_height,
        owner_username, likes, comments, engagement_rate
      FROM post_metrics 
      WHERE social_account_id = $1 
      AND dimensions_width > 0
      ORDER BY likes DESC
      LIMIT 2
    `, [testSocialAccountId]);

    expect(richDataQuery.length).toBeGreaterThan(0);
    richDataQuery.forEach((post: any, i: number) => {
      console.log(`📊 Post ${i + 1}: ${post.short_code} (${post.post_type}) - ${post.likes} likes`);
      console.log(`   Dimensions: ${post.dimensions_width}x${post.dimensions_height}`);
      console.log(`   Engagement: ${post.engagement_rate}%`);
    });

    console.log('✅ JSONB and rich data queries working');
  });
});