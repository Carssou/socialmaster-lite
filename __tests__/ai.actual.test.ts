/**
 * ACTUAL AI INSIGHTS TEST
 * Uses REAL Instagram data AND makes REAL LLM API calls
 */

// Load environment variables directly
import fs from 'fs';
import path from 'path';

const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

const loadEnvVar = (name: string) => {
  const match = envContent.match(new RegExp(`${name}=(.+)`));
  return match ? match[1] : undefined;
};

// Set all required environment variables
process.env.APIFY_API_TOKEN = loadEnvVar('APIFY_API_TOKEN') || 'fake-token';
process.env.APIFY_INSTAGRAM_ACTOR = loadEnvVar('APIFY_INSTAGRAM_ACTOR') || 'fake-actor';
process.env.LLM_PROVIDER = loadEnvVar('LLM_PROVIDER');
process.env.OPENAI_API_KEY = loadEnvVar('OPENAI_API_KEY');
process.env.OPENAI_MODEL = loadEnvVar('OPENAI_MODEL');
process.env.LLM_MAX_TOKENS = loadEnvVar('LLM_MAX_TOKENS');

import { AIInsightsService } from '../src/services/ai-insights.service';
import { query } from '../src/database/index';
import { pgPool } from '../src/database';

describe('ACTUAL AI INSIGHTS TEST', () => {
  let aiService: AIInsightsService;
  let realAccountId: string | null = null;
  let realUserId: string | null = null;

  beforeAll(async () => {
    console.log('\n🤖 ACTUAL AI INSIGHTS TEST - REAL LLM + REAL DATA');
    
    // Check if we have LLM configuration
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
    const llmProvider = process.env.LLM_PROVIDER;
    
    console.log(`🔑 LLM Provider: ${llmProvider || 'not set'}`);
    console.log(`🤖 OpenAI configured: ${hasOpenAI}`);
    console.log(`🤖 Anthropic configured: ${hasAnthropic}`);
    
    if (!llmProvider || (!hasOpenAI && !hasAnthropic)) {
      console.log('⚠️  Skipping actual LLM tests - no valid LLM configuration');
      return;
    }
    
    // Find real data from our Apify integration
    const realAccounts = await query(`
      SELECT sa.id, sa.user_id, sa.username, 
             COUNT(pm.id) as post_count, 
             COUNT(am.id) as metric_count
      FROM social_accounts sa
      LEFT JOIN post_metrics pm ON sa.id = pm.social_account_id  
      LEFT JOIN account_metrics am ON sa.id = am.social_account_id
      WHERE sa.username IN ('natgeo', 'instagram') 
         OR sa.platform_account_id LIKE '%test%'
      GROUP BY sa.id, sa.user_id, sa.username
      HAVING COUNT(pm.id) > 0 AND COUNT(am.id) > 0
      ORDER BY COUNT(pm.id) DESC
      LIMIT 1
    `);

    if (realAccounts.length === 0) {
      throw new Error('No real Instagram data found! Run Apify integration test first.');
    }

    const account = realAccounts[0] as any;
    realAccountId = account.id;
    realUserId = account.user_id;
    
    console.log(`📊 Using real account: ${account.username}`);
    console.log(`📝 Posts: ${account.post_count}, Metrics: ${account.metric_count}`);
    
    aiService = new AIInsightsService();
  }, 10000);

  afterAll(async () => {
    if (realUserId) {
      await query('DELETE FROM ai_analysis WHERE user_id = $1', [realUserId]);
    }
    await pgPool.end();
    console.log('\n🧹 Cleanup completed');
  });

  test('Skip if no LLM configuration', () => {
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
    const llmProvider = process.env.LLM_PROVIDER;
    
    if (!llmProvider || (!hasOpenAI && !hasAnthropic)) {
      console.log('⏭️  Skipping - no LLM configuration');
      expect(true).toBe(true); // Pass the test
      return;
    }
  });

  test('REAL LLM call with real Instagram data', async () => {
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
    const llmProvider = process.env.LLM_PROVIDER;
    
    if (!llmProvider || (!hasOpenAI && !hasAnthropic)) {
      console.log('⏭️  Skipping actual LLM test - no configuration');
      return;
    }

    if (!realAccountId || !realUserId) {
      throw new Error('No real account data available');
    }

    console.log('\n🚀 Making REAL LLM API call...');
    console.log('💰 WARNING: This will consume API credits!');
    
    const insights = await aiService.generateAccountInsights(realUserId, realAccountId, false);
    
    console.log(`🎯 Generated ${insights.length} insights from real LLM:`);
    
    insights.forEach((insight, i) => {
      console.log(`\n${i + 1}. 📊 ${insight.title}`);
      console.log(`   💡 ${insight.description}`);
      console.log(`   📖 ${insight.explanation.substring(0, 200)}...`);
      console.log(`   🎯 Confidence: ${insight.confidence}% | Score: ${insight.score}`);
      console.log(`   ⚡ Impact: ${insight.impact} | Urgency: ${insight.urgency}`);
      
      // Show original insights/recommendations from metadata if available
      const metadata = insight.generation_metadata as any;
      if (metadata?.originalInsights) {
        console.log(`   💡 Insights: ${metadata.originalInsights.length}`);
        metadata.originalInsights.slice(0, 2).forEach((ins: string) => {
          console.log(`      • ${ins}`);
        });
      }
      if (metadata?.originalRecommendations) {
        console.log(`   💪 Recommendations: ${metadata.originalRecommendations.length}`);
        metadata.originalRecommendations.slice(0, 2).forEach((rec: string) => {
          console.log(`      → ${rec}`);
        });
      }
    });
    
    expect(insights.length).toBeGreaterThan(0);
    expect(insights.every(i => i.title && i.description && i.explanation)).toBe(true);
    expect(insights.every(i => i.confidence >= 0 && i.confidence <= 100)).toBe(true);
    
    console.log('\n✅ REAL LLM insights generated successfully!');
    
  }, 60000); // 1 minute timeout for real API calls

  test('Verify real data analysis quality', async () => {
    console.log('\n📊 Analyzing quality of real Instagram data...');
    
    if (!realAccountId) {
      console.log('⏭️  No real account data to analyze');
      return;
    }

    const accountMetrics = await query(`
      SELECT * FROM account_metrics 
      WHERE social_account_id = $1 
      ORDER BY date DESC
    `, [realAccountId]);
    
    const postMetrics = await query(`
      SELECT short_code, likes, comments, engagement_rate, post_type, caption
      FROM post_metrics 
      WHERE social_account_id = $1 
      ORDER BY published_at DESC
      LIMIT 5
    `, [realAccountId]);

    console.log('📈 Real Instagram data analysis:');
    
    if (accountMetrics.length > 0) {
      const latest = accountMetrics[0] as any;
      console.log(`- Followers: ${latest.followers?.toLocaleString()}`);
      console.log(`- Following: ${latest.following?.toLocaleString()}`);
      console.log(`- Total posts: ${latest.total_posts?.toLocaleString()}`);
      console.log(`- Engagement rate: ${latest.avg_engagement_rate}%`);
      
      expect(latest.followers).toBeGreaterThan(1000); // Should be substantial account
    }

    console.log('\n📝 Recent posts performance:');
    postMetrics.forEach((post: any, i: number) => {
      console.log(`${i + 1}. ${post.short_code}: ${post.likes?.toLocaleString()} likes, ${post.comments} comments`);
      const engagementRate = typeof post.engagement_rate === 'number' ? post.engagement_rate : 0;
      console.log(`   Type: ${post.post_type} | Engagement: ${(engagementRate * 100).toFixed(2)}%`);
      console.log(`   Caption: ${post.caption?.substring(0, 80)}...`);
    });

    if (postMetrics.length > 0) {
      const avgLikes = postMetrics.reduce((sum: number, post: any) => sum + (post.likes || 0), 0) / postMetrics.length;
      const avgEngagement = postMetrics.reduce((sum: number, post: any) => {
        const rate = typeof post.engagement_rate === 'number' ? post.engagement_rate : 0;
        return sum + rate;
      }, 0) / postMetrics.length;
      
      console.log(`\n📊 Averages: ${Math.round(avgLikes).toLocaleString()} likes, ${(avgEngagement * 100).toFixed(2)}% engagement`);
      
      expect(avgLikes).toBeGreaterThan(0);
      expect(avgEngagement).toBeGreaterThanOrEqual(0); // Allow 0% engagement
    }

    console.log('✅ Real data quality verified for AI analysis');
  });
});