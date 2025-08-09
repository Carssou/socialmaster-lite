import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/api';
import { SocialAccount, AccountMetrics, AIInsight, AccountUsage } from '../types';
import {
  PlusIcon,
  ChartBarIcon,
  UserGroupIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

interface DashboardData {
  accounts: SocialAccount[];
  recentMetrics: AccountMetrics[];
  insights: AIInsight[];
  usage: AccountUsage;
}

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const { user } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load the data the dashboard actually needs
      console.log('=== DASHBOARD: Starting API calls ===');
      const [accounts, usage] = await Promise.all([
        apiClient.getSocialAccounts().catch(err => {
          console.error('Error fetching accounts:', err);
          return [];
        }),
        apiClient.getAccountUsage().catch(err => {
          console.error('Error fetching usage:', err);
          return { currentAccounts: 0, maxAccounts: 0, tier: 'free', canAddMore: false };
        })
      ]);

      // Debug what we're getting from the API
      console.log('=== DASHBOARD DEBUG ===');
      console.log('Raw accounts data:', accounts);
      console.log('Raw usage data:', usage);
      console.log('======================');
      
      // Backend now returns proper camelCase, use directly
      const convertedUsage = usage || { currentAccounts: 0, maxAccounts: 0, tier: 'free', canAddMore: false };
      
      console.log('Converted usage:', convertedUsage);
      
      setData({
        accounts,
        recentMetrics: [], // Not needed for basic dashboard
        insights: [], // Not needed for basic dashboard  
        usage: convertedUsage
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="text-sm text-red-700">{error}</div>
        <button
          onClick={loadDashboardData}
          className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!data) {
    return <div>No data available</div>;
  }

  // Extract data correctly
  const accounts = (data as any)?.accounts || [];  
  const usage = (data as any)?.usage || { maxAccounts: 0, currentAccounts: 0, tier: 'unknown', canAddMore: false };
  const insights = (data as any)?.insights || [];

  return (
    <div>
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Here's what's happening with your social media accounts
        </p>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Connected Accounts
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {usage?.currentAccounts || 0} / {usage?.maxAccounts || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Insights
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {insights?.length || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <EyeIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Plan
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 capitalize">
                    {((usage as any)?.tier)?.toUpperCase() || 'UNKNOWN'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Connected Accounts */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Connected Accounts
              </h3>
              {(usage as any)?.can_add_more && (
                <Link
                  to="/accounts"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
                  Add Account
                </Link>
              )}
            </div>
          </div>
          <div className="p-6">
            {(accounts?.length || 0) === 0 ? (
              <div className="text-center py-6">
                <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h4 className="mt-2 text-sm font-medium text-gray-900">
                  No accounts connected
                </h4>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by connecting your first social media account.
                </p>
                <div className="mt-6">
                  <Link
                    to="/accounts"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
                    Connect Account
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {accounts?.slice(0, 3).map((account: any) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-800">
                            {account.platform?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          @{account.username || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {account.platform || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          account.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {account.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
                {(accounts?.length || 0) > 3 && (
                  <div className="text-center pt-3">
                    <Link
                      to="/accounts"
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      View all {accounts?.length || 0} accounts →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recent Insights */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Recent Insights
              </h3>
              <Link
                to="/analytics"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            {(insights?.length || 0) === 0 ? (
              <div className="text-center py-6">
                <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h4 className="mt-2 text-sm font-medium text-gray-900">
                  No insights yet
                </h4>
                <p className="mt-1 text-sm text-gray-500">
                  Connect accounts and sync data to get AI-powered insights.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {insights?.slice(0, 3).map((insight: any) => (
                  <div key={insight.id} className="border-l-4 border-blue-400 pl-3">
                    <h4 className="text-sm font-medium text-gray-900">
                      {insight.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {insight.description}
                    </p>
                    <div className="flex items-center mt-2">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};