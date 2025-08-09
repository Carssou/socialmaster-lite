import React, { useEffect, useState } from 'react';
import { SocialAccount, AccountMetrics, AIInsight } from '../types';
import apiClient from '../services/api';
import {
  ChartBarIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';

export const Analytics: React.FC = () => {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [metrics, setMetrics] = useState<AccountMetrics[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      loadAccountData(selectedAccount);
    }
  }, [selectedAccount]);

  const loadAccounts = async () => {
    try {
      const accountsData = await apiClient.getSocialAccounts();
      console.log('ANALYTICS: Raw accounts data:', accountsData);
      console.log('ANALYTICS: Accounts length:', accountsData?.length);
      setAccounts(accountsData || []);
      if ((accountsData?.length || 0) > 0 && !selectedAccount) {
        setSelectedAccount(accountsData[0]?.id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const loadAccountData = async (accountId: string) => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      
      // Load metrics and insights in a single API call
      try {
        const { metrics, insights } = await apiClient.getAccountMetricsAndInsights(accountId);
        
        setMetrics(metrics);
        setInsights(insights);
        
        // If no metrics, show helpful message
        if (metrics.length === 0) {
          setError('No metrics data available. Sync your account to collect data from Instagram.');
        }
      } catch (err: any) {
        console.warn('Failed to load metrics and insights:', err.message);
        setMetrics([]);
        setInsights([]);
        setError('Failed to load account data. Please try syncing your account.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load account data');
    } finally {
      setLoading(false);
    }
  };

  const selectedAccountData = accounts.find(acc => acc.id === selectedAccount);
  const latestMetrics = metrics[0];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-600">
          View metrics and AI-powered insights for your social media accounts
        </p>
      </div>

      {(accounts?.length || 0) === 0 ? (
        <div className="text-center py-12">
          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No accounts connected
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Connect social media accounts to view analytics.
          </p>
        </div>
      ) : (
        <>
          {/* Account selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Account
            </label>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {accounts?.map((account) => (
                <option key={account.id} value={account.id}>
                  @{account.username} ({account.platform})
                </option>
              ))}
            </select>
          </div>

          {selectedAccount && (
            <div className="flex justify-end mb-4">
              <button
                onClick={async () => {
                  try {
                    setLoading(true);
                    await apiClient.syncAccountData(selectedAccount);
                    await loadAccountData(selectedAccount);
                    setError('');
                  } catch (err: any) {
                    setError(err.message || 'Failed to sync account data');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Syncing...' : 'Sync Account Data'}
              </button>
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Key Metrics Overview */}
              {latestMetrics && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Account Overview</h2>
                      {selectedAccountData && (
                        <p className="text-sm text-gray-600 mt-1">
                          @{selectedAccountData.username} • Last updated: {
                            latestMetrics.lastUpdated || latestMetrics.updatedAt || latestMetrics.createdAt 
                              ? new Date(latestMetrics.lastUpdated || latestMetrics.updatedAt || latestMetrics.createdAt!).toLocaleDateString()
                              : 'Unknown'
                          }
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Followers
                      </dt>
                      <dd className="mt-2 text-2xl font-bold text-gray-900">
                        {latestMetrics.followersCount.toLocaleString()}
                      </dd>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Following
                      </dt>
                      <dd className="mt-2 text-2xl font-bold text-gray-900">
                        {latestMetrics.followingCount.toLocaleString()}
                      </dd>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Posts
                      </dt>
                      <dd className="mt-2 text-2xl font-bold text-gray-900">
                        {latestMetrics.postsCount.toLocaleString()}
                      </dd>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Engagement
                      </dt>
                      <dd className="mt-2 text-2xl font-bold text-blue-600">
                        {(latestMetrics.engagementRate * 100).toFixed(2)}%
                      </dd>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Avg Likes
                      </dt>
                      <dd className="mt-2 text-2xl font-bold text-gray-900">
                        {Math.round(latestMetrics.avgLikes).toLocaleString()}
                      </dd>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Avg Comments
                      </dt>
                      <dd className="mt-2 text-2xl font-bold text-gray-900">
                        {Math.round(latestMetrics.avgComments).toLocaleString()}
                      </dd>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Insights Cards */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">AI-Powered Insights</h2>
                  {(insights?.length || 0) > 0 && (
                    <span className="text-sm text-gray-500">
                      {insights.length} insight{insights.length !== 1 ? 's' : ''} found
                    </span>
                  )}
                </div>

                {(insights?.length || 0) > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2">
                    {insights
                      .sort((a, b) => (b.confidence || 0) - (a.confidence || 0)) // Sort by confidence descending
                      .map((insight) => (
                      <div key={insight.id} className="bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
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
                                    const sections = insight.recommendation.split(/\n(?=[A-Z]+:)/);
                                    
                                    return sections.map((section, index) => {
                                      const lines = section.trim().split('\n');
                                      const titleMatch = lines[0].match(/^([A-Z\s]+):\s*(.*)/);
                                      
                                      if (titleMatch) {
                                        const [, title, firstContent] = titleMatch;
                                        const restContent = lines.slice(1);
                                        const allContent = [firstContent, ...restContent].filter(Boolean);
                                        
                                        return (
                                          <div key={index} className={index > 0 ? "mt-4" : ""}>
                                            <h4 className="text-xs font-semibold text-blue-900 uppercase tracking-wide mb-2">
                                              {title.trim()}
                                            </h4>
                                            <div className="space-y-1">
                                              {allContent.map((content, contentIndex) => {
                                                // Check if it's a bullet point
                                                if (content.trim().startsWith('•') || content.trim().startsWith('-')) {
                                                  return (
                                                    <div key={contentIndex} className="flex items-start gap-2">
                                                      <span className="text-blue-600 text-xs mt-1">•</span>
                                                      <p className="text-sm text-blue-800 leading-relaxed flex-1">
                                                        {content.trim().replace(/^[•-]\s*/, '')}
                                                      </p>
                                                    </div>
                                                  );
                                                } else {
                                                  return (
                                                    <p key={contentIndex} className="text-sm text-blue-800 leading-relaxed">
                                                      {content.trim()}
                                                    </p>
                                                  );
                                                }
                                              })}
                                            </div>
                                          </div>
                                        );
                                      } else {
                                        // Fallback for sections without clear titles
                                        return (
                                          <div key={index} className={index > 0 ? "mt-4" : ""}>
                                            <p className="text-sm text-blue-800 leading-relaxed">
                                              {section.trim()}
                                            </p>
                                          </div>
                                        );
                                      }
                                    });
                                  })()}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                            <span className={`font-medium ${
                              (insight.confidence || 0) >= 0.8 
                                ? 'text-green-600' 
                                : (insight.confidence || 0) >= 0.6 
                                ? 'text-yellow-600' 
                                : 'text-gray-500'
                            }`}>
                              {Math.round((insight.confidence || 0) * 100)}% confidence
                            </span>
                            <span>{new Date(insight.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center">
                    <LightBulbIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No insights yet</h3>
                    <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
                      {metrics.length === 0 
                        ? 'Sync your account data first to generate AI-powered insights about your content performance.'
                        : 'AI insights are generated every 12 hours after account sync. Check back soon!'
                      }
                    </p>
                    {selectedAccount && (
                      <button
                        onClick={() => loadAccountData(selectedAccount)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {metrics.length === 0 ? 'Sync Account Data' : 'Check for New Insights'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* No metrics state */}
              {!latestMetrics && (
                <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center">
                  <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
                  <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
                    Sync your Instagram account to start collecting metrics and generate AI insights.
                  </p>
                  {selectedAccount && (
                    <button
                      onClick={() => loadAccountData(selectedAccount)}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Sync Account Data
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};