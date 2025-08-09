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
      const accounts = (accountsData as any)?.accounts || [];
      setAccounts(accounts);
      if ((accounts?.length || 0) > 0 && !selectedAccount) {
        setSelectedAccount(accounts[0]?.id);
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
      
      // Load metrics and insights separately to handle failures gracefully
      const metricsData = await apiClient.getAccountMetrics(accountId).catch(() => []);
      const insightsData = await apiClient.getAIInsights(accountId).catch((err) => {
        console.warn('Failed to load insights:', err.message);
        return [];
      });
      
      setMetrics(metricsData);
      setInsights(insightsData);
      
      // If no metrics, show helpful message
      if (metricsData.length === 0) {
        setError('No metrics data available. Sync your account to collect data from Instagram.');
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Metrics */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Latest Metrics
                  </h3>
                  {selectedAccountData && (
                    <p className="text-sm text-gray-500">
                      @{selectedAccountData.username}
                    </p>
                  )}
                </div>
                <div className="p-6">
                  {latestMetrics ? (
                    <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Followers
                        </dt>
                        <dd className="mt-1 text-2xl font-semibold text-gray-900">
                          {latestMetrics.followersCount.toLocaleString()}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Following
                        </dt>
                        <dd className="mt-1 text-2xl font-semibold text-gray-900">
                          {latestMetrics.followingCount.toLocaleString()}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Posts
                        </dt>
                        <dd className="mt-1 text-2xl font-semibold text-gray-900">
                          {latestMetrics.postsCount.toLocaleString()}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Engagement Rate
                        </dt>
                        <dd className="mt-1 text-2xl font-semibold text-gray-900">
                          {(latestMetrics.engagementRate * 100).toFixed(2)}%
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Avg Likes
                        </dt>
                        <dd className="mt-1 text-2xl font-semibold text-gray-900">
                          {Math.round(latestMetrics.avgLikes).toLocaleString()}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Avg Comments
                        </dt>
                        <dd className="mt-1 text-2xl font-semibold text-gray-900">
                          {Math.round(latestMetrics.avgComments).toLocaleString()}
                        </dd>
                      </div>
                    </dl>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-sm text-gray-500">
                        No metrics data available. 
                        <button
                          onClick={() => selectedAccount && loadAccountData(selectedAccount)}
                          className="ml-1 text-blue-600 hover:text-blue-500"
                        >
                          Sync account data
                        </button>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Insights */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    AI Insights
                  </h3>
                </div>
                <div className="p-6">
                  {(insights?.length || 0) > 0 ? (
                    <div className="space-y-4">
                      {insights?.slice(0, 4).map((insight) => (
                        <div key={insight.id} className="border-l-4 border-blue-400 pl-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900">
                                {insight.title}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1">
                                {insight.description}
                              </p>
                              {insight.recommendation && (
                                <p className="text-xs text-blue-600 mt-2">
                                  💡 {insight.recommendation}
                                </p>
                              )}
                            </div>
                            <span
                              className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                                insight.priority === 'high'
                                  ? 'bg-red-100 text-red-800'
                                  : insight.priority === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {insight.priority}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center text-xs text-gray-400">
                            <span className="capitalize">{insight.category}</span>
                            <span className="mx-1">•</span>
                            <span>{Math.round(insight.confidence * 100)}% confidence</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <LightBulbIcon className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="text-sm text-gray-500 mt-2">
                        {metrics.length === 0 
                          ? 'Sync your account data first to generate AI insights.'
                          : 'No insights available yet. AI insights are generated every 12 hours after account sync.'
                        }
                        {selectedAccount && (
                          <>
                            {' '}
                            <button
                              onClick={() => loadAccountData(selectedAccount)}
                              className="text-blue-600 hover:text-blue-500"
                            >
                              {metrics.length === 0 ? 'Sync account first' : 'Check for insights'}
                            </button>
                          </>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};