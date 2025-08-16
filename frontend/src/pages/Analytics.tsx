import React, { useEffect, useState } from 'react';
import { SocialAccount, AccountMetrics, AIInsight } from '../types';
import apiClient from '../services/api';
import { ChartBarIcon, LightBulbIcon, CalendarIcon, ArrowDownTrayIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';
import { FeedbackButtons } from '../components/FeedbackButtons';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

export const Analytics: React.FC = () => {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [metrics, setMetrics] = useState<AccountMetrics[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const [generatingFreshInsights, setGeneratingFreshInsights] = useState(false);
  const [error, setError] = useState<string>('');
  const [chartType, setChartType] = useState<'growth' | 'engagement' | 'content'>('growth');
  // TODO: Add timeRange state for time selector functionality (issue needed)
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonAccount, setComparisonAccount] = useState<string>('');

  useEffect(() => {
    loadAccounts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedAccount) {
      loadAccountData(selectedAccount);
    }
  }, [selectedAccount]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAccounts = async () => {
    try {
      const accountsData = await apiClient.getSocialAccounts();
      console.log('ANALYTICS: Raw accounts data:', accountsData);
      console.log('ANALYTICS: Accounts length:', accountsData?.length);
      setAccounts(accountsData || []);
      if ((accountsData?.length || 0) > 0 && !selectedAccount) {
        setSelectedAccount(accountsData[0]?.id);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load accounts';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadAccountData = async (accountId: string) => {
    // Prevent concurrent data loading requests
    if (loading || generatingInsights) {
      console.log('ANALYTICS: Already loading account data, ignoring duplicate request');
      return;
    }

    try {
      setLoading(true);
      setError(''); // Clear previous errors

      // First, load existing insights without triggering generation
      try {
        const existingInsights = await apiClient.getAIInsights(accountId);
        setInsights(existingInsights);

        console.log(
          'ANALYTICS DEBUG: Loaded existing insights:',
          existingInsights.length
        );
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.warn('Failed to load existing insights:', errorMessage);
        setInsights([]);
      }

      setLoading(false);

      // Now trigger metrics and new insights generation while showing existing insights
      setGeneratingInsights(true);
      try {
        const { metrics, insights: newInsights } =
          await apiClient.getAccountMetricsAndInsights(accountId);

        setMetrics(metrics);
        // Preserve existing insights while adding new ones
        setInsights(newInsights);

        // Debug logging
        console.log(
          'ANALYTICS DEBUG: Total insights after generation:',
          newInsights.length
        );
        console.log(
          'ANALYTICS DEBUG: New insights:',
          newInsights.filter((i) => i.isNew).length
        );
        console.log(
          'ANALYTICS DEBUG: Previous insights:',
          newInsights.filter((i) => !i.isNew).length
        );

        // If no metrics, show helpful message
        if (metrics.length === 0) {
          setError(
            'No metrics data available. Sync your account to collect data from Instagram.'
          );
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.warn('Failed to generate new insights:', errorMessage);
        setError('Failed to generate new insights. Please try again.');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load account data';
      setError(errorMessage);
      setLoading(false);
    } finally {
      setGeneratingInsights(false);
    }
  };

  const generateFreshInsights = async (accountId: string) => {
    // Prevent concurrent generation requests
    if (generatingFreshInsights) {
      console.log('ANALYTICS: Already generating fresh insights, ignoring duplicate request');
      return;
    }
    
    // Store existing insights to preserve them during generation
    const existingInsights = [...insights];
    
    try {
      setGeneratingFreshInsights(true);
      setError('');
      
      // Trigger fresh scraping + AI insights with forceRefresh=true (2-day minimum)
      // Backend handles the 1-minute buffer between Apify and LLM automatically
      console.log('ANALYTICS: Triggering fresh Instagram scraping...');
      await apiClient.syncAccountData(accountId);
      
      console.log('ANALYTICS: Generating fresh AI insights...');
      const freshInsights = await apiClient.getAIInsights(accountId, true);
      
      // Combine existing insights with fresh ones, ensuring existing ones remain visible
      setInsights(freshInsights);
      
      // Refresh metrics to show latest data
      const { metrics } = await apiClient.getAccountMetricsAndInsights(accountId);
      setMetrics(metrics);
      
      console.log('ANALYTICS: Generated fresh insights:', freshInsights.length);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.warn('Failed to generate fresh insights:', errorMessage);
      setError(errorMessage || 'Failed to generate fresh insights. Please try again later.');
      // Restore existing insights on error to ensure they don't disappear
      setInsights(existingInsights);
    } finally {
      setGeneratingFreshInsights(false);
    }
  };

  const handleInsightRating = async (insightId: string, rating: boolean) => {
    try {
      await apiClient.rateInsight(insightId, rating);
      
      // Update the insight in the state
      setInsights(prevInsights => 
        prevInsights.map(insight => 
          insight.id === insightId 
            ? { ...insight, userRating: rating }
            : insight
        )
      );
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to rate insight:', errorMessage);
      // Could show a toast notification here
    }
  };

  const selectedAccountData = accounts.find(
    (acc) => acc.id === selectedAccount
  );
  const latestMetrics = metrics[0];

  // Process real metrics data for charts with safe date handling
  const chartData = metrics.slice(0, 7).reverse().map((metric, index) => {
    // Safe date handling - use current date if createdAt is invalid
    const dateValue = metric.createdAt ? new Date(metric.createdAt) : new Date();
    const safeDate = isNaN(dateValue.getTime()) ? new Date() : dateValue;
    
    return {
      date: safeDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: safeDate.toISOString().split('T')[0],
      followers: Number(metric.followersCount || 0),
      engagement: Number(((Number(metric.engagementRate) || 0) * 100).toFixed(2)),
      likes: Number(metric.avgLikes || 0),
      comments: Number(metric.avgComments || 0),
      posts: Number(metric.postsCount || 0)
    };
  });

  // Calculate growth metrics from real data
  const calculateGrowth = (current: number, previous: number) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  const getGrowthData = () => {
    if (chartData.length < 2) return { followers: 0, engagement: 0, posts: 0 };
    
    const latest = chartData[chartData.length - 1];
    const previous = chartData[0];
    
    return {
      followers: calculateGrowth(latest.followers, previous.followers),
      engagement: calculateGrowth(latest.engagement, previous.engagement),
      posts: calculateGrowth(latest.posts, previous.posts)
    };
  };

  const growthData = getGrowthData();

  // Export functionality - exports current metrics and insights
  const exportData = (format: 'csv' | 'json') => {
    const dataToExport = {
      account: selectedAccountData?.username,
      exportDate: new Date().toISOString(),
      metrics: latestMetrics,
      insights: insights.map(i => ({
        title: i.title,
        description: i.description,
        category: i.category,
        priority: i.priority,
        confidence: i.confidence,
        createdAt: i.createdAt
      }))
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${selectedAccountData?.username}.json`;
      a.click();
    } else {
      // CSV export - basic metrics only
      const csvHeaders = ['Metric', 'Value'];
      const csvRows = [
        ['Account', selectedAccountData?.username || ''],
        ['Followers', latestMetrics?.followersCount || '0'],
        ['Following', latestMetrics?.followingCount || '0'],
        ['Posts', latestMetrics?.postsCount || '0'],
        ['Engagement Rate', ((Number(latestMetrics?.engagementRate) || 0) * 100).toFixed(2) + '%'],
        ['Avg Likes', latestMetrics?.avgLikes || '0'],
        ['Avg Comments', latestMetrics?.avgComments || '0']
      ];
      
      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.join(','))
        .join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${selectedAccountData?.username}.csv`;
      a.click();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Track performance and get AI-powered insights for your social media accounts
          </p>
        </div>
        
        {selectedAccount && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportData('csv')}
              className="inline-flex items-center gap-2"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportData('json')}
              className="inline-flex items-center gap-2"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Export JSON
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => generateFreshInsights(selectedAccount)}
              disabled={generatingFreshInsights || generatingInsights || loading}
              className="inline-flex items-center gap-2"
            >
              <LightBulbIcon className="h-4 w-4" />
              {generatingFreshInsights 
                ? 'Generating...' 
                : generatingInsights 
                  ? 'Processing...' 
                  : 'Fresh Insights'
              }
            </Button>
          </div>
        )}
      </div>

      {(accounts?.length || 0) === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <ChartBarIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <CardTitle className="mb-2">No accounts connected</CardTitle>
            <CardDescription className="mb-6">
              Connect social media accounts to start viewing analytics and insights.
            </CardDescription>
            <Button variant="primary">
              Connect Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Controls Section */}
          <Card>
            <CardHeader>
              <CardTitle>Analytics Controls</CardTitle>
              <CardDescription>Configure your analytics view and data preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Account Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account
                  </label>
                  <select
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  >
                    {accounts?.map((account) => (
                      <option key={account.id} value={account.id}>
                        @{account.username} ({account.platform})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Chart Type Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chart Type
                  </label>
                  <select
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value as 'growth' | 'engagement' | 'content')}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  >
                    <option value="growth">Growth Metrics</option>
                    <option value="engagement">Engagement Trends</option>
                    <option value="content">Content Performance</option>
                  </select>
                </div>

                {/* TODO: Add Time Range selector (7d/30d/90d/1y) - needs backend support for filtering stored data */}

                {/* Comparison Toggle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Compare Accounts
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={comparisonMode}
                      onChange={(e) => setComparisonMode(e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-600">Enable comparison</span>
                  </div>
                  {comparisonMode && accounts.length > 1 && (
                    <select
                      value={comparisonAccount}
                      onChange={(e) => setComparisonAccount(e.target.value)}
                      className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    >
                      <option value="">Select account to compare</option>
                      {accounts
                        ?.filter(acc => acc.id !== selectedAccount)
                        .map((account) => (
                          <option key={account.id} value={account.id}>
                            @{account.username} ({account.platform})
                          </option>
                        ))
                      }
                    </select>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>


          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="text-sm text-red-700">{error}</div>
              </CardContent>
            </Card>
          )}

          {loading ? (
            <Card className="py-16">
              <CardContent className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4 mx-auto"></div>
                <CardDescription className="max-w-md mx-auto">
                  {selectedAccount
                    ? 'Processing account data and generating AI insights... This may take up to 2 minutes.'
                    : 'Loading analytics...'}
                </CardDescription>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {/* KPI Cards with Trends */}
              {latestMetrics && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-primary-600/5"></div>
                    <CardContent className="relative pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Followers</p>
                          <p className="text-3xl font-bold text-gray-900">
                            {Number(latestMetrics.followersCount || 0).toLocaleString()}
                          </p>
                        </div>
                        <div className="p-3 bg-primary-100 rounded-full">
                          <ChartBarIcon className="h-6 w-6 text-primary-600" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center">
                        {growthData.followers >= 0 ? (
                          <ArrowTrendingUpIcon className="h-4 w-4 text-success-500 mr-1" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-4 w-4 text-error-500 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${
                          growthData.followers >= 0 ? 'text-success-600' : 'text-error-600'
                        }`}>
                          {growthData.followers.toFixed(1)}%
                        </span>
                        <span className="text-sm text-gray-500 ml-1">vs last period</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-success-500/10 to-success-600/5"></div>
                    <CardContent className="relative pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
                          <p className="text-3xl font-bold text-gray-900">
                            {(Number(latestMetrics.engagementRate || 0) * 100).toFixed(2)}%
                          </p>
                        </div>
                        <div className="p-3 bg-success-100 rounded-full">
                          <LightBulbIcon className="h-6 w-6 text-success-600" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center">
                        {growthData.engagement >= 0 ? (
                          <ArrowTrendingUpIcon className="h-4 w-4 text-success-500 mr-1" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-4 w-4 text-error-500 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${
                          growthData.engagement >= 0 ? 'text-success-600' : 'text-error-600'
                        }`}>
                          {growthData.engagement.toFixed(1)}%
                        </span>
                        <span className="text-sm text-gray-500 ml-1">vs last period</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-warning-500/10 to-warning-600/5"></div>
                    <CardContent className="relative pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Avg Likes</p>
                          <p className="text-3xl font-bold text-gray-900">
                            {Math.round(Number(latestMetrics.avgLikes || 0)).toLocaleString()}
                          </p>
                        </div>
                        <div className="p-3 bg-warning-100 rounded-full">
                          <ChartBarIcon className="h-6 w-6 text-warning-600" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Comments</span>
                          <span className="font-medium text-gray-900">
                            {Math.round(Number(latestMetrics.avgComments || 0)).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-coral-500/10 to-coral-600/5"></div>
                    <CardContent className="relative pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Posts</p>
                          <p className="text-3xl font-bold text-gray-900">
                            {Number(latestMetrics.postsCount || 0).toLocaleString()}
                          </p>
                        </div>
                        <div className="p-3 bg-coral-100 rounded-full">
                          <CalendarIcon className="h-6 w-6 text-coral-600" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Following</span>
                          <span className="font-medium text-gray-900">
                            {Number(latestMetrics.followingCount || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Charts Section - Now showing real data! */}
              {latestMetrics && chartData.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {chartType === 'growth' && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Growth Overview</CardTitle>
                        <CardDescription>Follower growth over time</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                              <defs>
                                <linearGradient id="followersGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#635BFF" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#635BFF" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                              <XAxis 
                                dataKey="date" 
                                stroke="#64748b"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                              />
                              <YAxis 
                                stroke="#64748b"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => value.toLocaleString()}
                              />
                              <Tooltip 
                                contentStyle={{
                                  backgroundColor: 'white',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '8px',
                                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                                formatter={(value: number) => [value.toLocaleString(), 'Followers']}
                              />
                              <Area
                                type="monotone"
                                dataKey="followers"
                                stroke="#635BFF"
                                strokeWidth={2}
                                fill="url(#followersGradient)"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {chartType === 'engagement' && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Engagement Trends</CardTitle>
                        <CardDescription>Daily engagement rate over time</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                              <XAxis 
                                dataKey="date" 
                                stroke="#64748b"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                              />
                              <YAxis 
                                stroke="#64748b"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}%`}
                              />
                              <Tooltip 
                                contentStyle={{
                                  backgroundColor: 'white',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '8px',
                                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                                formatter={(value: number) => [`${value}%`, 'Engagement']}
                              />
                              <Line
                                type="monotone"
                                dataKey="engagement"
                                stroke="#00D924"
                                strokeWidth={3}
                                dot={{ fill: '#00D924', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, stroke: '#00D924', strokeWidth: 2 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {chartType === 'content' && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Content Performance</CardTitle>
                        <CardDescription>Likes and comments over time</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                              <XAxis 
                                dataKey="date" 
                                stroke="#64748b"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                              />
                              <YAxis 
                                stroke="#64748b"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                              />
                              <Tooltip 
                                contentStyle={{
                                  backgroundColor: 'white',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '8px',
                                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                              />
                              <Bar dataKey="likes" fill="#FFB800" radius={[2, 2, 0, 0]} />
                              <Bar dataKey="comments" fill="#FF5A5F" radius={[2, 2, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Performance Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Summary</CardTitle>
                      <CardDescription>Key metrics for the selected period</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-600">Best Performing Day</span>
                          <span className="text-sm font-bold text-gray-900">
                            {chartData.reduce((max, day) => 
                              day.engagement > max.engagement ? day : max, chartData[0]
                            )?.date || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-600">Average Daily Engagement</span>
                          <span className="text-sm font-bold text-gray-900">
                            {(chartData.reduce((sum, day) => sum + day.engagement, 0) / chartData.length).toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-600">Total Growth</span>
                          <span className="text-sm font-bold text-gray-900">
                            {chartData.length > 1 ? 
                              (chartData[chartData.length - 1].followers - chartData[0].followers).toLocaleString()
                              : '0'
                            } followers
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Account Information */}
              {selectedAccountData && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                          <span className="text-lg font-semibold text-primary-700">
                            {selectedAccountData.platform?.charAt(0)?.toUpperCase() || 'I'}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            @{selectedAccountData.username}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {selectedAccountData.platform} • Last updated:{' '}
                            {(() => {
                              const dateStr = latestMetrics?.lastUpdated || latestMetrics?.updatedAt || latestMetrics?.createdAt;
                              if (!dateStr) return 'Unknown';
                              const date = new Date(dateStr);
                              return isNaN(date.getTime()) ? 'Unknown' : date.toLocaleDateString();
                            })()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={selectedAccountData.isActive ? 'success' : 'secondary'}>
                        {selectedAccountData.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI Insights Cards */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    AI-Powered Insights
                  </h2>
                  {(insights?.length || 0) > 0 && (
                    <span className="text-sm text-gray-500">
                      {insights.length} insight
                      {insights.length !== 1 ? 's' : ''} found
                    </span>
                  )}
                </div>

                {(insights?.length || 0) > 0 ? (
                  <div className="space-y-8">
                    {/* New Insights Section */}
                    {(insights.filter((i) => i.isNew).length > 0 ||
                      generatingInsights) && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Latest Insights
                        </h3>

                        {generatingInsights &&
                        insights.filter((i) => i.isNew).length === 0 ? (
                          <div className="flex flex-col items-center justify-center p-12 bg-blue-50 border border-blue-200 rounded-xl">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                            <p className="text-blue-700 text-center max-w-md">
                              Generating AI insights... This may take up to 2
                              minutes.
                            </p>
                          </div>
                        ) : (
                          <div className="grid gap-6 md:grid-cols-2">
                            {insights
                              .filter((i) => i.isNew)
                              .sort(
                                (a, b) =>
                                  (b.confidence || 0) - (a.confidence || 0)
                              )
                              .map((insight) => (
                                <div
                                  key={insight.id}
                                  className="bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
                                >
                                  <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                          <span
                                            className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                                              insight.priority === 'high'
                                                ? 'bg-red-100 text-red-800'
                                                : insight.priority === 'medium'
                                                  ? 'bg-yellow-100 text-yellow-800'
                                                  : 'bg-green-100 text-green-800'
                                            }`}
                                          >
                                            {insight.priority}
                                          </span>
                                          <span className="text-xs text-gray-500 capitalize">
                                            {insight.category}
                                          </span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                          {insight.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                                          {insight.description}
                                        </p>
                                      </div>
                                    </div>

                                    {insight.recommendation && (
                                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                        <div className="flex items-start gap-2">
                                          <LightBulbIcon className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                          <div className="flex-1">
                                            {(() => {
                                              // Parse the structured recommendation text
                                              const sections =
                                                insight.recommendation.split(
                                                  /\n(?=[A-Z]+:)/
                                                );

                                              return sections.map(
                                                (section, index) => {
                                                  const lines = section
                                                    .trim()
                                                    .split('\n');
                                                  const titleMatch =
                                                    lines[0].match(
                                                      /^([A-Z\s]+):\s*(.*)/
                                                    );

                                                  if (titleMatch) {
                                                    const [
                                                      ,
                                                      title,
                                                      firstContent,
                                                    ] = titleMatch;
                                                    const restContent =
                                                      lines.slice(1);
                                                    const allContent = [
                                                      firstContent,
                                                      ...restContent,
                                                    ].filter(Boolean);

                                                    return (
                                                      <div
                                                        key={index}
                                                        className={
                                                          index > 0
                                                            ? 'mt-4'
                                                            : ''
                                                        }
                                                      >
                                                        <h4 className="text-xs font-semibold text-blue-900 uppercase tracking-wide mb-2">
                                                          {title.trim()}
                                                        </h4>
                                                        <div className="space-y-1">
                                                          {allContent.map(
                                                            (
                                                              content,
                                                              contentIndex
                                                            ) => {
                                                              // Check if it's a bullet point
                                                              if (
                                                                content
                                                                  .trim()
                                                                  .startsWith(
                                                                    '•'
                                                                  ) ||
                                                                content
                                                                  .trim()
                                                                  .startsWith(
                                                                    '-'
                                                                  )
                                                              ) {
                                                                return (
                                                                  <div
                                                                    key={
                                                                      contentIndex
                                                                    }
                                                                    className="flex items-start gap-2"
                                                                  >
                                                                    <span className="text-blue-600 text-xs mt-1">
                                                                      •
                                                                    </span>
                                                                    <p className="text-sm text-blue-800 leading-relaxed flex-1">
                                                                      {content
                                                                        .trim()
                                                                        .replace(
                                                                          /^[•-]\s*/,
                                                                          ''
                                                                        )}
                                                                    </p>
                                                                  </div>
                                                                );
                                                              } else {
                                                                return (
                                                                  <p
                                                                    key={
                                                                      contentIndex
                                                                    }
                                                                    className="text-sm text-blue-800 leading-relaxed"
                                                                  >
                                                                    {content.trim()}
                                                                  </p>
                                                                );
                                                              }
                                                            }
                                                          )}
                                                        </div>
                                                      </div>
                                                    );
                                                  } else {
                                                    // Fallback for sections without clear titles
                                                    return (
                                                      <div
                                                        key={index}
                                                        className={
                                                          index > 0
                                                            ? 'mt-4'
                                                            : ''
                                                        }
                                                      >
                                                        <p className="text-sm text-blue-800 leading-relaxed">
                                                          {section.trim()}
                                                        </p>
                                                      </div>
                                                    );
                                                  }
                                                }
                                              );
                                            })()}
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                                      <div className="flex items-center gap-4">
                                        <span
                                          className={`font-medium ${
                                            (insight.confidence || 0) >= 0.8
                                              ? 'text-green-600'
                                              : (insight.confidence || 0) >= 0.6
                                                ? 'text-yellow-600'
                                                : 'text-gray-500'
                                          }`}
                                        >
                                          {Math.round(
                                            (insight.confidence || 0) * 100
                                          )}
                                          % confidence
                                        </span>
                                        <FeedbackButtons
                                          rating={insight.userRating ?? null}
                                          onRating={(userRating) => handleInsightRating(insight.id, userRating)}
                                        />
                                      </div>
                                      <span>
                                        {(() => {
                                          if (!insight.createdAt) return 'Unknown';
                                          const date = new Date(insight.createdAt);
                                          return isNaN(date.getTime()) ? 'Unknown' : date.toLocaleDateString();
                                        })()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Previous Insights Section */}
                    {insights.filter((i) => !i.isNew).length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                          Previously Generated Insights
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                          Based on earlier data analysis
                        </p>
                        <div className="grid gap-6 md:grid-cols-2">
                          {insights
                            .filter((i) => !i.isNew)
                            .sort(
                              (a, b) =>
                                (b.confidence || 0) - (a.confidence || 0)
                            ) // Sort by confidence descending
                            .map((insight) => (
                              <div
                                key={insight.id}
                                className="bg-gray-50 border rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
                              >
                                <div className="p-6">
                                  <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <span
                                          className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                                            insight.priority === 'high'
                                              ? 'bg-red-100 text-red-800'
                                              : insight.priority === 'medium'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-green-100 text-green-800'
                                          }`}
                                        >
                                          {insight.priority}
                                        </span>
                                        <span className="text-xs text-gray-500 capitalize">
                                          {insight.category}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                          • Generated{' '}
                                          {(() => {
                                            if (!insight.createdAt) return 'Unknown';
                                            const date = new Date(insight.createdAt);
                                            return isNaN(date.getTime()) ? 'Unknown' : date.toLocaleDateString();
                                          })()}
                                        </span>
                                      </div>
                                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {insight.title}
                                      </h3>
                                      <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                                        {insight.description}
                                      </p>
                                    </div>
                                  </div>

                                  {insight.recommendation && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                      <div className="flex items-start gap-2">
                                        <LightBulbIcon className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1">
                                          {(() => {
                                            // Parse the structured recommendation text
                                            const sections =
                                              insight.recommendation.split(
                                                /\n(?=[A-Z]+:)/
                                              );

                                            return sections.map(
                                              (section, index) => {
                                                const lines = section
                                                  .trim()
                                                  .split('\n');
                                                const titleMatch =
                                                  lines[0].match(
                                                    /^([A-Z\s]+):\s*(.*)/
                                                  );

                                                if (titleMatch) {
                                                  const [
                                                    ,
                                                    title,
                                                    firstContent,
                                                  ] = titleMatch;
                                                  const restContent =
                                                    lines.slice(1);
                                                  const allContent = [
                                                    firstContent,
                                                    ...restContent,
                                                  ].filter(Boolean);

                                                  return (
                                                    <div
                                                      key={index}
                                                      className={
                                                        index > 0 ? 'mt-4' : ''
                                                      }
                                                    >
                                                      <h4 className="text-xs font-semibold text-blue-900 uppercase tracking-wide mb-2">
                                                        {title.trim()}
                                                      </h4>
                                                      <div className="space-y-1">
                                                        {allContent.map(
                                                          (
                                                            content,
                                                            contentIndex
                                                          ) => {
                                                            // Check if it's a bullet point
                                                            if (
                                                              content
                                                                .trim()
                                                                .startsWith(
                                                                  '•'
                                                                ) ||
                                                              content
                                                                .trim()
                                                                .startsWith('-')
                                                            ) {
                                                              return (
                                                                <div
                                                                  key={
                                                                    contentIndex
                                                                  }
                                                                  className="flex items-start gap-2"
                                                                >
                                                                  <span className="text-blue-600 text-xs mt-1">
                                                                    •
                                                                  </span>
                                                                  <p className="text-sm text-blue-800 leading-relaxed flex-1">
                                                                    {content
                                                                      .trim()
                                                                      .replace(
                                                                        /^[•-]\s*/,
                                                                        ''
                                                                      )}
                                                                  </p>
                                                                </div>
                                                              );
                                                            } else {
                                                              return (
                                                                <p
                                                                  key={
                                                                    contentIndex
                                                                  }
                                                                  className="text-sm text-blue-800 leading-relaxed"
                                                                >
                                                                  {content.trim()}
                                                                </p>
                                                              );
                                                            }
                                                          }
                                                        )}
                                                      </div>
                                                    </div>
                                                  );
                                                } else {
                                                  // Fallback for sections without clear titles
                                                  return (
                                                    <div
                                                      key={index}
                                                      className={
                                                        index > 0 ? 'mt-4' : ''
                                                      }
                                                    >
                                                      <p className="text-sm text-blue-800 leading-relaxed">
                                                        {section.trim()}
                                                      </p>
                                                    </div>
                                                  );
                                                }
                                              }
                                            );
                                          })()}
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-4">
                                      <span
                                        className={`font-medium ${
                                          (insight.confidence || 0) >= 0.8
                                            ? 'text-green-600'
                                            : (insight.confidence || 0) >= 0.6
                                              ? 'text-yellow-600'
                                              : 'text-gray-500'
                                        }`}
                                      >
                                        {Math.round(
                                          (insight.confidence || 0) * 100
                                        )}
                                        % confidence
                                      </span>
                                      <FeedbackButtons
                                        rating={insight.userRating ?? null}
                                        onRating={(userRating) => handleInsightRating(insight.id, userRating)}
                                      />
                                    </div>
                                    <span>
                                      {(() => {
                                        if (!insight.createdAt) return 'Unknown';
                                        const date = new Date(insight.createdAt);
                                        return isNaN(date.getTime()) ? 'Unknown' : date.toLocaleDateString();
                                      })()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                        )
                      </div>
                    )}
                  </div>
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="text-center py-12">
                      <LightBulbIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <CardTitle className="mb-2">No insights yet</CardTitle>
                      <CardDescription className="mb-6 max-w-md mx-auto">
                        {metrics.length === 0
                          ? 'Sync your account data first to generate AI-powered insights about your content performance.'
                          : 'AI insights are generated every 12 hours after account sync. Check back soon!'}
                      </CardDescription>
                      {selectedAccount && (
                        <Button
                          variant="outline"
                          onClick={() => loadAccountData(selectedAccount)}
                        >
                          {metrics.length === 0
                            ? 'Sync Account Data'
                            : 'Check for New Insights'}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* No metrics state */}
              {!latestMetrics && (
                <Card className="border-dashed">
                  <CardContent className="text-center py-12">
                    <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <CardTitle className="mb-2">No data available</CardTitle>
                    <CardDescription className="mb-6 max-w-md mx-auto">
                      Sync your Instagram account to start collecting metrics and
                      generate AI insights.
                    </CardDescription>
                    {selectedAccount && (
                      <Button
                        onClick={() => loadAccountData(selectedAccount)}
                      >
                        Sync Account Data
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
