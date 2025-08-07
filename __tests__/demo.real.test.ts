/**
 * DEMO REAL DATA TEST
 * Uses the actual demo accounts (now with real Instagram usernames)
 */

// Load environment
import fs from 'fs';
import path from 'path';

const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

const loadEnvVar = (name: string) => {
  const match = envContent.match(new RegExp(`${name}=(.+)`));
  return match ? match[1] : undefined;
};

process.env.APIFY_API_TOKEN = loadEnvVar('APIFY_API_TOKEN');
process.env.APIFY_INSTAGRAM_ACTOR = loadEnvVar('APIFY_INSTAGRAM_ACTOR');
process.env.LLM_PROVIDER = loadEnvVar('LLM_PROVIDER');
process.env.OPENAI_API_KEY = loadEnvVar('OPENAI_API_KEY');

import { ApifyService } from '../src/services/apify.service';
import { AIInsightsService } from '../src/services/ai-insights.service';
import { query } from '../src/database/index';
import { pgPool } from '../src/database';

describe('DEMO ACCOUNTS WITH REAL DATA', () => {
  
  afterAll(async () => {
    await pgPool.end();
  });

  test('Load real Instagram data for demo accounts', async () => {
    console.log('\n🎯 LOADING REAL DATA FOR DEMO ACCOUNTS');
    
    // Get demo Instagram accounts
    const demoAccounts = await query(`
      SELECT u.id as user_id, u.email, u.name,
             sa.id as account_id, sa.username, sa.platform
      FROM users u 
      JOIN social_accounts sa ON u.id = sa.user_id
      WHERE u.email LIKE '%demo%' AND sa.platform = 'instagram'
      ORDER BY u.email
    `);

    console.log(`📱 Found ${demoAccounts.length} demo Instagram accounts`);
    
    const apifyService = new ApifyService();
    const aiService = new AIInsightsService();

    for (const account of demoAccounts) {
      const acc = account as any;
      console.log(`\n👤 Processing: ${acc.name}`);
      console.log(`📊 Scraping @${acc.username} data...`);

      try {
        // Load real data using the account's actual username
        await apifyService.collectInstagramMetrics(acc.account_id, acc.username);
        
        // Verify data
        const metrics = await query('SELECT * FROM account_metrics WHERE social_account_id = $1', [acc.account_id]);
        const posts = await query('SELECT * FROM post_metrics WHERE social_account_id = $1 LIMIT 3', [acc.account_id]);
        
        console.log(`✅ Loaded: ${metrics.length} account metrics, ${posts.length} posts`);
        
        if (metrics.length > 0) {
          const m = metrics[0] as any;
          console.log(`   📈 ${m.followers.toLocaleString()} followers, ${m.avg_engagement_rate}% engagement`);
        }

        // Generate AI insights
        console.log('🧠 Generating AI insights...');
        const insights = await aiService.generateAccountInsights(acc.user_id, acc.account_id);
        console.log(`🎯 Generated ${insights.length} insights`);

        expect(metrics.length).toBeGreaterThan(0);
        expect(posts.length).toBeGreaterThan(0);
        expect(insights.length).toBeGreaterThan(0);

      } catch (error) {
        console.error(`❌ Failed for ${acc.username}:`, error);
        throw error;
      }
    }

    console.log('\n🎉 ALL DEMO ACCOUNTS LOADED WITH REAL DATA!');
    
  }, 300000); // 5 minute timeout for multiple API calls

  test('Verify demo accounts have complete data', async () => {
    console.log('\n📊 VERIFYING DEMO ACCOUNT DATA');

    const summary = await query(`
      SELECT u.email, u.name, sa.username,
             COUNT(DISTINCT am.id) as account_metrics,
             COUNT(DISTINCT pm.id) as post_metrics,
             COUNT(DISTINCT ai.id) as ai_insights
      FROM users u
      JOIN social_accounts sa ON u.id = sa.user_id
      LEFT JOIN account_metrics am ON sa.id = am.social_account_id
      LEFT JOIN post_metrics pm ON sa.id = pm.social_account_id  
      LEFT JOIN ai_analysis ai ON u.id = ai.user_id AND ai.is_active = true
      WHERE u.email LIKE '%demo%' AND sa.platform = 'instagram'
      GROUP BY u.email, u.name, sa.username
      ORDER BY u.email
    `);

    console.log('\n📋 DEMO ACCOUNT SUMMARY:');
    summary.forEach((row: any) => {
      console.log(`👤 ${row.name} (@${row.username})`);
      console.log(`   📊 ${row.account_metrics} account metrics`);
      console.log(`   📝 ${row.post_metrics} post metrics`);
      console.log(`   🧠 ${row.ai_insights} AI insights`);
      
      expect(parseInt(row.account_metrics)).toBeGreaterThan(0);
      expect(parseInt(row.post_metrics)).toBeGreaterThan(0);
      expect(parseInt(row.ai_insights)).toBeGreaterThan(0);
    });

    console.log('\n✅ ALL DEMO ACCOUNTS HAVE COMPLETE DATA!');
  });
});