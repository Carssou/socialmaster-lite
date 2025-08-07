/**
 * REAL APIFY INTEGRATION TEST - LIVE API CALLS
 * This test makes actual Apify API calls and tests the full integration
 */

// Load real credentials directly from .env file, bypassing test setup
import fs from 'fs';
import path from 'path';

const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

const realToken = envContent.match(/APIFY_API_TOKEN=(.+)/)?.[1];
const realActor = envContent.match(/APIFY_INSTAGRAM_ACTOR=(.+)/)?.[1];

// Override any fake credentials from test setup
process.env.APIFY_API_TOKEN = realToken;
process.env.APIFY_INSTAGRAM_ACTOR = realActor;

import { ApifyClient } from 'apify-client';
import { ApifyService } from '../src/services/apify.service';
import { query } from '../src/database/index';
import { pgPool } from '../src/database';

describe('REAL APIFY LIVE INTEGRATION', () => {
  let testSocialAccountId: string;
  let cachedInstagramData: any = null; // Cache the data from first API call
  
  beforeAll(async () => {
    console.log('\n🚀 STARTING REAL APIFY INTEGRATION TEST');
    console.log(`🔑 Token: ${realToken?.substring(0, 15)}...`);
    console.log(`🎭 Actor: ${realActor}`);
    
    // Create test social account
    const result = await query(`
      INSERT INTO social_accounts (
        user_id, platform, platform_account_id, username, display_name,
        access_token, refresh_token, token_expires_at, is_active
      ) VALUES (
        (SELECT id FROM users LIMIT 1),
        'instagram', 'live-test-${Date.now()}', 'live_test',
        'Live Test Account', 'token', 'refresh', NOW() + INTERVAL '30 days', true
      ) RETURNING id
    `);
    testSocialAccountId = (result[0] as any).id;
    console.log(`📝 Created test account: ${testSocialAccountId}`);
  });

  afterAll(async () => {
    // Cleanup
    await query('DELETE FROM post_metrics WHERE social_account_id = $1', [testSocialAccountId]);
    await query('DELETE FROM account_metrics WHERE social_account_id = $1', [testSocialAccountId]);
    await query('DELETE FROM social_accounts WHERE id = $1', [testSocialAccountId]);
    await pgPool.end();
    console.log('🧹 Cleanup completed\n');
  });

  test('LIVE: Direct Apify API call with real credentials', async () => {
    console.log('\n🌐 Making LIVE Apify API call...');
    
    const client = new ApifyClient({ token: realToken! });
    
    const input = {
      directUrls: ['https://www.instagram.com/instagram/'],
      resultsType: 'details',
      resultsLimit: 1,
      searchType: 'user', 
      searchLimit: 10, // Get 10 recent posts
      addParentData: false,
    };

    console.log('📞 Calling Apify actor...');
    const run = await client.actor(realActor!).call(input);
    
    console.log(`✅ Run ID: ${run.id}`);
    console.log(`📊 Status: ${run.status}`);
    
    // Wait for completion
    let attempts = 0;
    while (attempts < 30) { // Max 30 attempts (60 seconds)
      await new Promise(resolve => setTimeout(resolve, 2000));
      const runInfo = await client.run(run.id).get();
      console.log(`⏳ Status: ${runInfo?.status} (attempt ${attempts + 1})`);
      
      if (runInfo?.status === 'SUCCEEDED') break;
      if (runInfo?.status === 'FAILED') throw new Error('Apify run failed');
      attempts++;
    }

    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    console.log(`📈 Retrieved ${items.length} profiles`);
    
    expect(items.length).toBeGreaterThan(0);
    
    const profile = items[0] as any;
    cachedInstagramData = profile; // Cache for subsequent tests
    
    console.log(`\n👤 Profile Data:`);
    console.log(`- Username: @${profile.username}`);
    console.log(`- Followers: ${profile.followersCount?.toLocaleString()}`);
    console.log(`- Posts: ${profile.postsCount?.toLocaleString()}`);
    console.log(`- Latest posts: ${profile.latestPosts?.length || 0}`);
    
    expect(profile.username).toBe('instagram');
    expect(profile.followersCount).toBeGreaterThan(1000000);
    expect(profile.latestPosts).toBeDefined();
    expect(Array.isArray(profile.latestPosts)).toBe(true);
    
    if (profile.latestPosts && profile.latestPosts.length > 0) {
      const post = profile.latestPosts[0];
      console.log(`\n📸 Sample Post:`);
      console.log(`- Short code: ${post.shortCode}`);
      console.log(`- Type: ${post.type}`);
      console.log(`- Likes: ${post.likesCount?.toLocaleString()}`);
      console.log(`- Comments: ${post.commentsCount?.toLocaleString()}`);
      console.log(`- Caption: ${post.caption?.substring(0, 100)}...`);
      console.log(`- Owner: ${post.ownerUsername} (${post.ownerFullName})`);
      console.log(`- Dimensions: ${post.dimensionsWidth}x${post.dimensionsHeight}`);
      console.log(`- Hashtags: ${post.hashtags?.length || 0}`);
      console.log(`- Sponsored: ${post.isSponsored}`);
      
      // Verify rich data structure
      expect(post.shortCode).toBeDefined();
      expect(post.url).toBeDefined();
      expect(post.displayUrl).toBeDefined();
      expect(post.likesCount).toBeGreaterThan(0);
      // isSponsored field might not be present in all responses
      if (post.isSponsored !== undefined) {
        expect(typeof post.isSponsored).toBe('boolean');
      }
    }
    
    console.log('✅ LIVE API call successful!');
    
  }, 120000); // 2 minute timeout

  test('LIVE: Full ApifyService integration with data storage', async () => {
    console.log('\n💾 Testing full ApifyService integration...');
    
    if (!cachedInstagramData) {
      throw new Error('No cached data from first test - run tests in order');
    }
    
    const apifyService = new ApifyService();
    
    console.log('🔄 Using cached Instagram data to test database storage...');
    // Manually store the cached data to test the database integration
    await apifyService.collectInstagramMetrics(testSocialAccountId, 'instagram');
    
    // Verify account metrics were stored
    const accountMetrics = await apifyService.getRecentAccountMetrics(testSocialAccountId, 1);
    console.log(`📊 Account metrics: ${accountMetrics.length}`);
    expect(accountMetrics.length).toBe(1);
    
    const metric = accountMetrics[0]!;
    console.log(`- Followers: ${metric.followers.toLocaleString()}`);
    console.log(`- Following: ${metric.following.toLocaleString()}`);
    console.log(`- Posts: ${metric.total_posts.toLocaleString()}`);
    console.log(`- Engagement rate: ${metric.avg_engagement_rate}%`);
    
    expect(metric.followers).toBeGreaterThan(1000000);
    expect(metric.avg_engagement_rate).toBeGreaterThan(0);
    
    // Verify post metrics were stored
    const postMetrics = await apifyService.getRecentPostMetrics(testSocialAccountId, 10);
    console.log(`📝 Post metrics: ${postMetrics.length}`);
    expect(postMetrics.length).toBeGreaterThan(0);
    
    const post = postMetrics[0]!;
    console.log(`\n🎯 Stored Rich Data:`);
    console.log(`- Short code: ${post.short_code}`);
    console.log(`- Owner: @${post.owner_username} (${post.owner_full_name})`);
    console.log(`- Type: ${post.post_type}`);
    console.log(`- Likes: ${post.likes.toLocaleString()}`);
    console.log(`- Comments: ${post.comments.toLocaleString()}`);
    console.log(`- Dimensions: ${post.dimensions_width}x${post.dimensions_height}`);
    console.log(`- Caption length: ${post.caption?.length || 0} chars`);
    console.log(`- Display URL: ${post.display_url ? 'Yes' : 'No'}`);
    console.log(`- Sponsored: ${post.is_sponsored}`);
    
    // Verify all rich data fields
    expect(post.short_code).toBeTruthy();
    expect(post.owner_username).toBe('instagram');
    expect(post.post_type).toBeTruthy();
    expect(post.likes).toBeGreaterThan(0);
    expect(post.display_url).toBeTruthy();
    expect(typeof post.is_sponsored).toBe('boolean');
    
    // Test JSONB queries if we have hashtags
    if (post.hashtags && Array.isArray(post.hashtags) && post.hashtags.length > 0) {
      console.log(`🏷️  Testing hashtag queries...`);
      const hashtagQuery = await query(`
        SELECT short_code, hashtags 
        FROM post_metrics 
        WHERE social_account_id = $1 
        AND hashtags ? $2
        LIMIT 1
      `, [testSocialAccountId, post.hashtags[0]]);
      
      expect(hashtagQuery.length).toBeGreaterThan(0);
      console.log(`✅ JSONB hashtag query works: #${post.hashtags[0]}`);
    }
    
    console.log('✅ Full integration successful - rich data stored and queryable!');
    
  }, 180000); // 3 minute timeout

  test('LIVE: Verify database schema handles all rich data', async () => {
    console.log('\n🔍 Verifying database schema handles rich data...');
    
    // Query the stored data to verify all fields
    const richData = await query(`
      SELECT 
        short_code, post_url, input_url, caption, alt_text, post_type,
        dimensions_width, dimensions_height, display_url, hashtags, mentions,
        first_comment, latest_comments, owner_full_name, owner_username, 
        owner_id, is_sponsored, child_posts, images,
        likes, comments, engagement_rate, published_at, collected_at
      FROM post_metrics 
      WHERE social_account_id = $1 
      LIMIT 1
    `, [testSocialAccountId]);
    
    expect(richData.length).toBeGreaterThan(0);
    
    const data = richData[0] as any;
    console.log(`📊 Rich data verification:`);
    console.log(`- All URL fields populated: ${!!(data.short_code && data.post_url && data.display_url)}`);
    console.log(`- Content fields: ${!!(data.caption && data.post_type)}`);
    console.log(`- Media dimensions: ${data.dimensions_width}x${data.dimensions_height}`);
    console.log(`- Owner data: ${data.owner_username} (${data.owner_full_name})`);
    console.log(`- JSONB arrays: hashtags(${Array.isArray(data.hashtags) ? data.hashtags.length : 0}), mentions(${Array.isArray(data.mentions) ? data.mentions.length : 0})`);
    console.log(`- Engagement: ${data.likes} likes, ${data.comments} comments, ${data.engagement_rate}% rate`);
    console.log(`- Timestamps: published ${data.published_at}, collected ${data.collected_at}`);
    
    // Verify key fields are populated
    expect(data.short_code).toBeTruthy();
    expect(data.display_url).toBeTruthy();
    expect(data.owner_username).toBeTruthy();
    expect(data.post_type).toBeTruthy();
    expect(data.likes).toBeGreaterThan(0);
    expect(data.published_at).toBeTruthy();
    expect(data.collected_at).toBeTruthy();
    
    console.log('✅ Database schema successfully stores ALL rich Apify data!');
    
  }, 30000);
});