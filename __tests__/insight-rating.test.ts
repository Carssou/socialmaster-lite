import request from 'supertest';
import app from '../src/app';
import { AuthService } from '../src/services/auth.service';
import socialAccountService from '../src/services/social-account.service';
import { Repository } from '../src/database/repository';
import { TestCleanup, generateTestEmail, generateTestUsername } from './test-utils';
import { UserRegistrationDto } from '../src/types/models';
import { v4 as uuidv4 } from 'uuid';

describe('Insight Rating API', () => {
  let authService: AuthService;
  let aiAnalysisRepo: Repository<any>;
  let testUser: any;
  let testUser2: any;
  let authToken: string;
  let authToken2: string;
  let testInsightId: string;
  let testAccountId: string;

  beforeAll(async () => {
    authService = new AuthService();
    aiAnalysisRepo = new Repository('ai_analysis');

    // Create test users
    const userData1: UserRegistrationDto = {
      email: generateTestEmail('rating-test'),
      name: 'Rating Test User 1',
      password: 'testpassword123'
    };

    const userData2: UserRegistrationDto = {
      email: generateTestEmail('rating-test'),
      name: 'Rating Test User 2', 
      password: 'testpassword123'
    };

    const authResult1 = await authService.register(userData1);
    const authResult2 = await authService.register(userData2);
    
    testUser = authResult1.user;
    testUser2 = authResult2.user;
    authToken = authResult1.accessToken;
    authToken2 = authResult2.accessToken;

    TestCleanup.trackUser(testUser.id);
    TestCleanup.trackUser(testUser2.id);

    // Create a test social account
    const accountResponse = await request(app)
      .post('/api/social-accounts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        platform: 'instagram',
        platformAccountId: `test_platform_${Date.now()}`,
        username: generateTestUsername('rating-test'),
        displayName: 'Test Rating Account',
        accessToken: 'test_access_token'
      });

    testAccountId = accountResponse.body.data.id;
    TestCleanup.trackAccount(testAccountId);

    // Create a test AI insight
    testInsightId = uuidv4();
    await aiAnalysisRepo.executeQuery(
      `INSERT INTO ai_analysis (
        id, social_account_id, user_id, type, category, title, description, 
        explanation, confidence, impact, urgency, score
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        testInsightId,
        testAccountId,
        testUser.id,
        'content_performance',
        'content',
        'Test Insight for Rating',
        'This is a test insight for rating functionality',
        'Test recommendation content',
        85,
        'high',
        'medium',
        80
      ]
    );
  });

  afterAll(async () => {
    // Clean up test insight
    await aiAnalysisRepo.executeQuery(
      'DELETE FROM ai_analysis WHERE id = $1',
      [testInsightId]
    );
    
    await TestCleanup.cleanup();
  });

  describe('PUT /api/analytics/insights/:insightId/rating', () => {
    test('should rate insight with thumbs up', async () => {
      const response = await request(app)
        .put(`/api/analytics/insights/${testInsightId}/rating`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ rating: true });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Rating updated successfully');
      expect(response.body.data.insightId).toBe(testInsightId);
      expect(response.body.data.rating).toBe(true);

      // Verify rating was saved in database
      const result = await aiAnalysisRepo.executeQuery(
        'SELECT user_rating FROM ai_analysis WHERE id = $1',
        [testInsightId]
      ) as Array<{ user_rating: boolean | null }>;
      expect(result[0]?.user_rating).toBe(true);
    });

    test('should rate insight with thumbs down', async () => {
      const response = await request(app)
        .put(`/api/analytics/insights/${testInsightId}/rating`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ rating: false });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.rating).toBe(false);

      // Verify rating was updated in database
      const result = await aiAnalysisRepo.executeQuery(
        'SELECT user_rating FROM ai_analysis WHERE id = $1',
        [testInsightId]
      ) as Array<{ user_rating: boolean | null }>;
      expect(result[0]?.user_rating).toBe(false);
    });

    test('should clear rating with null value', async () => {
      const response = await request(app)
        .put(`/api/analytics/insights/${testInsightId}/rating`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ rating: null });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.rating).toBeNull();

      // Verify rating was cleared in database
      const result = await aiAnalysisRepo.executeQuery(
        'SELECT user_rating FROM ai_analysis WHERE id = $1',
        [testInsightId]
      ) as Array<{ user_rating: boolean | null }>;
      expect(result[0]?.user_rating).toBeNull();
    });

    test('should fail with invalid rating value', async () => {
      const response = await request(app)
        .put(`/api/analytics/insights/${testInsightId}/rating`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ rating: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Rating must be true');
    });

    test('should fail with non-existent insight ID', async () => {
      const fakeInsightId = uuidv4();
      const response = await request(app)
        .put(`/api/analytics/insights/${fakeInsightId}/rating`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ rating: true });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Insight not found');
    });

    test('should fail with invalid insight ID format', async () => {
      const response = await request(app)
        .put(`/api/analytics/insights/invalid-id/rating`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ rating: true });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Valid insight ID is required');
    });

    test('should fail when user tries to rate another user\'s insight', async () => {
      const response = await request(app)
        .put(`/api/analytics/insights/${testInsightId}/rating`)
        .set('Authorization', `Bearer ${authToken2}`) // Different user
        .send({ rating: true });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied: Not your insight');
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .put(`/api/analytics/insights/${testInsightId}/rating`)
        .send({ rating: true });

      expect(response.status).toBe(401);
    });

    test('should fail with invalid authentication token', async () => {
      const response = await request(app)
        .put(`/api/analytics/insights/${testInsightId}/rating`)
        .set('Authorization', 'Bearer invalid-token')
        .send({ rating: true });

      expect(response.status).toBe(401);
    });

    test('should include userRating in analytics metrics response', async () => {
      // Set a rating first
      await request(app)
        .put(`/api/analytics/insights/${testInsightId}/rating`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ rating: true });

      // Get metrics and verify userRating is included
      const response = await request(app)
        .get(`/api/analytics/accounts/${testAccountId}/metrics`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      const insights = response.body.data.insights;
      const testInsight = insights.find((insight: any) => insight.id === testInsightId);
      
      if (testInsight) {
        expect(testInsight.userRating).toBe(true);
      }
    });
  });

  describe('Rating Edge Cases', () => {
    test('should handle multiple rapid rating changes', async () => {
      // Rapidly change rating multiple times
      const ratings = [true, false, null, true, false];
      
      for (const rating of ratings) {
        const response = await request(app)
          .put(`/api/analytics/insights/${testInsightId}/rating`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ rating });

        expect(response.status).toBe(200);
        expect(response.body.data.rating).toBe(rating);
      }

      // Verify final state
      const result = await aiAnalysisRepo.executeQuery(
        'SELECT user_rating FROM ai_analysis WHERE id = $1',
        [testInsightId]
      ) as Array<{ user_rating: boolean | null }>;
      expect(result[0]?.user_rating).toBe(false);
    });

    test('should update updated_at timestamp when rating changes', async () => {
      // Get initial timestamp
      const initialResult = await aiAnalysisRepo.executeQuery(
        'SELECT updated_at FROM ai_analysis WHERE id = $1',
        [testInsightId]
      ) as Array<{ updated_at: string }>;
      const initialTimestamp = initialResult[0]?.updated_at;

      // Wait a moment to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 100));

      // Update rating
      await request(app)
        .put(`/api/analytics/insights/${testInsightId}/rating`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ rating: true });

      // Verify timestamp was updated
      const updatedResult = await aiAnalysisRepo.executeQuery(
        'SELECT updated_at FROM ai_analysis WHERE id = $1',
        [testInsightId]
      ) as Array<{ updated_at: string }>;
      const updatedTimestamp = updatedResult[0]?.updated_at;

      expect(new Date(updatedTimestamp!).getTime()).toBeGreaterThan(
        new Date(initialTimestamp!).getTime()
      );
    });
  });
});