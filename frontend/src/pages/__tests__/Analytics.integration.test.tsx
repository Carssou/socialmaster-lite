import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Analytics } from '../Analytics';
import apiClient from '../../services/api';
import { AuthProvider } from '../../contexts/AuthContext';
import { BrowserRouter } from 'react-router-dom';

const mockApiClient = apiClient as any;

// Mock data
const mockAccounts = [
  {
    id: 'account-1',
    platform: 'instagram',
    username: 'test_account',
    displayName: 'Test Account',
  }
];

const mockMetrics = [
  {
    followersCount: 1000,
    followingCount: 500,
    postsCount: 50,
    avgLikes: 100,
    avgComments: 10,
    engagementRate: 0.11,
    lastUpdated: '2024-01-01T00:00:00Z',
    postsAnalyzed: 20,
  }
];

const mockInsights = [
  {
    id: 'insight-1',
    type: 'content_performance',
    category: 'content',
    title: 'Test Insight 1',
    description: 'This is a test insight for rating',
    recommendation: 'IMMEDIATE ACTIONS:\nTest recommendation content',
    confidence: 0.85,
    priority: 'high',
    createdAt: '2024-01-01T00:00:00Z',
    isNew: true,
    userRating: null,
  },
  {
    id: 'insight-2',
    type: 'engagement_analysis',
    category: 'performance',
    title: 'Test Insight 2',
    description: 'Another test insight',
    recommendation: 'STRATEGY:\nAnother recommendation',
    confidence: 0.75,
    priority: 'medium',
    createdAt: '2023-12-25T00:00:00Z',
    isNew: false,
    userRating: true,
  }
];

// Mock the API client to include authentication state
vi.mock('../../services/api', () => ({
  default: {
    getSocialAccounts: vi.fn(),
    getAccountMetricsAndInsights: vi.fn(),
    getAIInsights: vi.fn(),
    syncAccountData: vi.fn(),
    rateInsight: vi.fn(),
    isAuthenticated: vi.fn(() => true),
    getProfile: vi.fn(() => Promise.resolve({
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      tier: 'free',
      isActive: true,
      emailVerified: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    })),
  }
}));

const AnalyticsWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
);

describe('Analytics Page - Rating Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default API responses
    mockApiClient.getSocialAccounts.mockResolvedValue(mockAccounts);
    mockApiClient.getAccountMetricsAndInsights.mockResolvedValue({
      metrics: mockMetrics,
      insights: mockInsights,
    });
    mockApiClient.getAIInsights.mockResolvedValue(mockInsights);
    mockApiClient.syncAccountData.mockResolvedValue({ success: true });
    mockApiClient.rateInsight.mockResolvedValue({ success: true });
  });

  describe('Rating Display', () => {
    it('should display feedback buttons for each insight', async () => {
      render(
        <AnalyticsWrapper>
          <Analytics />
        </AnalyticsWrapper>
      );

      // Wait for insights to load
      await waitFor(() => {
        expect(screen.getByText('Test Insight 1')).toBeInTheDocument();
      });

      // Check that feedback buttons are present for each insight
      const thumbsUpButtons = screen.getAllByTitle('This insight was helpful');
      const thumbsDownButtons = screen.getAllByTitle('This insight was not helpful');

      expect(thumbsUpButtons).toHaveLength(2); // One for each insight
      expect(thumbsDownButtons).toHaveLength(2);
    });

    it('should show correct initial rating states', async () => {
      render(
        <AnalyticsWrapper>
          <Analytics />
        </AnalyticsWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Insight 1')).toBeInTheDocument();
      });

      // Find the insight cards
      const insight1Card = screen.getByText('Test Insight 1').closest('.bg-white, .bg-gray-50');
      const insight2Card = screen.getByText('Test Insight 2').closest('.bg-white, .bg-gray-50');

      // Insight 1 should have no rating (neutral buttons)
      const insight1ThumbsUp = insight1Card?.querySelector('[title="This insight was helpful"]');
      expect(insight1ThumbsUp).toHaveClass('text-gray-400');

      // Insight 2 should have thumbs up rating
      const insight2ThumbsUp = insight2Card?.querySelector('[title="This insight was helpful"]');
      expect(insight2ThumbsUp).toHaveClass('bg-green-100', 'text-green-700');
    });
  });

  describe('Rating Interactions', () => {
    it('should call API and update state when thumbs up is clicked', async () => {
      const user = userEvent.setup();
      render(
        <AnalyticsWrapper>
          <Analytics />
        </AnalyticsWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Insight 1')).toBeInTheDocument();
      });

      // Find and click thumbs up on the first insight
      const insight1Card = screen.getByText('Test Insight 1').closest('.bg-white, .bg-gray-50');
      const thumbsUpButton = insight1Card?.querySelector('[title="This insight was helpful"]') as HTMLElement;
      
      expect(thumbsUpButton).toBeInTheDocument();
      await user.click(thumbsUpButton);

      // Verify API was called
      expect(mockApiClient.rateInsight).toHaveBeenCalledWith('insight-1', true);

      // Verify visual state updated
      await waitFor(() => {
        expect(thumbsUpButton).toHaveClass('bg-green-100', 'text-green-700');
      });
    });

    it('should call API and update state when thumbs down is clicked', async () => {
      const user = userEvent.setup();
      render(
        <AnalyticsWrapper>
          <Analytics />
        </AnalyticsWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Insight 1')).toBeInTheDocument();
      });

      // Find and click thumbs down on the first insight
      const insight1Card = screen.getByText('Test Insight 1').closest('.bg-white, .bg-gray-50');
      const thumbsDownButton = insight1Card?.querySelector('[title="This insight was not helpful"]') as HTMLElement;
      
      expect(thumbsDownButton).toBeInTheDocument();
      await user.click(thumbsDownButton);

      // Verify API was called
      expect(mockApiClient.rateInsight).toHaveBeenCalledWith('insight-1', false);

      // Verify visual state updated
      await waitFor(() => {
        expect(thumbsDownButton).toHaveClass('bg-red-100', 'text-red-700');
      });
    });

    it('should handle rating changes (thumbs up to thumbs down)', async () => {
      const user = userEvent.setup();
      
      // Start with an insight that has thumbs up
      const insightsWithRating = [
        { ...mockInsights[0], userRating: true },
        mockInsights[1]
      ];
      
      mockApiClient.getAccountMetricsAndInsights.mockResolvedValue({
        metrics: mockMetrics,
        insights: insightsWithRating,
      });

      render(
        <AnalyticsWrapper>
          <Analytics />
        </AnalyticsWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Insight 1')).toBeInTheDocument();
      });

      // Find and click thumbs down to change rating
      const insight1Card = screen.getByText('Test Insight 1').closest('.bg-white, .bg-gray-50');
      const thumbsDownButton = insight1Card?.querySelector('[title="This insight was not helpful"]') as HTMLElement;
      
      await user.click(thumbsDownButton);

      // Verify API was called with new rating
      expect(mockApiClient.rateInsight).toHaveBeenCalledWith('insight-1', false);
    });

    it('should handle API errors gracefully', async () => {
      const user = userEvent.setup();
      
      // Mock API error
      mockApiClient.rateInsight.mockRejectedValue(new Error('Network error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <AnalyticsWrapper>
          <Analytics />
        </AnalyticsWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Insight 1')).toBeInTheDocument();
      });

      // Click thumbs up
      const insight1Card = screen.getByText('Test Insight 1').closest('.bg-white, .bg-gray-50');
      const thumbsUpButton = insight1Card?.querySelector('[title="This insight was helpful"]') as HTMLElement;
      
      await user.click(thumbsUpButton);

      // Verify error was logged
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to rate insight:', 'Network error');
      });

      // State should not update on error (button should remain neutral)
      expect(thumbsUpButton).toHaveClass('text-gray-400');

      consoleSpy.mockRestore();
    });
  });

  describe('Rating in Different Sections', () => {
    it('should show rating buttons in both Latest and Previous insights sections', async () => {
      render(
        <AnalyticsWrapper>
          <Analytics />
        </AnalyticsWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Latest Insights')).toBeInTheDocument();
        expect(screen.getByText('Previously Generated Insights')).toBeInTheDocument();
      });

      // Count all feedback buttons
      const allThumbsUpButtons = screen.getAllByTitle('This insight was helpful');
      const allThumbsDownButtons = screen.getAllByTitle('This insight was not helpful');

      expect(allThumbsUpButtons.length).toBeGreaterThanOrEqual(2);
      expect(allThumbsDownButtons.length).toBeGreaterThanOrEqual(2);
    });

    it('should work independently for insights in different sections', async () => {
      const user = userEvent.setup();
      render(
        <AnalyticsWrapper>
          <Analytics />
        </AnalyticsWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Insight 1')).toBeInTheDocument();
        expect(screen.getByText('Test Insight 2')).toBeInTheDocument();
      });

      // Click rating buttons on different insights
      const allThumbsUpButtons = screen.getAllByTitle('This insight was helpful');
      
      await user.click(allThumbsUpButtons[0]); // First insight
      await user.click(allThumbsUpButtons[1]); // Second insight

      // Verify both API calls were made
      expect(mockApiClient.rateInsight).toHaveBeenCalledTimes(2);
      expect(mockApiClient.rateInsight).toHaveBeenNthCalledWith(1, 'insight-1', true);
      expect(mockApiClient.rateInsight).toHaveBeenNthCalledWith(2, 'insight-2', true);
    });
  });

  describe('Loading States', () => {
    it('should not show rating buttons when insights are loading', () => {
      // Mock loading state (empty insights)
      mockApiClient.getAccountMetricsAndInsights.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ metrics: [], insights: [] }), 1000))
      );

      render(
        <AnalyticsWrapper>
          <Analytics />
        </AnalyticsWrapper>
      );

      // Should show loading state, not rating buttons
      expect(screen.queryByTitle('This insight was helpful')).not.toBeInTheDocument();
      expect(screen.getByText(/Processing account data/)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle insights without userRating field', async () => {
      const insightsWithoutRating = mockInsights.map(insight => {
        const { userRating, ...rest } = insight;
        return rest;
      });

      mockApiClient.getAccountMetricsAndInsights.mockResolvedValue({
        metrics: mockMetrics,
        insights: insightsWithoutRating,
      });

      render(
        <AnalyticsWrapper>
          <Analytics />
        </AnalyticsWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Insight 1')).toBeInTheDocument();
      });

      // Should still show neutral rating buttons
      const thumbsUpButtons = screen.getAllByTitle('This insight was helpful');
      expect(thumbsUpButtons[0]).toHaveClass('text-gray-400');
    });

    it('should handle undefined userRating gracefully', async () => {
      const insightsWithUndefinedRating = mockInsights.map(insight => ({
        ...insight,
        userRating: undefined,
      }));

      mockApiClient.getAccountMetricsAndInsights.mockResolvedValue({
        metrics: mockMetrics,
        insights: insightsWithUndefinedRating,
      });

      expect(() => {
        render(
          <AnalyticsWrapper>
            <Analytics />
          </AnalyticsWrapper>
        );
      }).not.toThrow();
    });
  });
});