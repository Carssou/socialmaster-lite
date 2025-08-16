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
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

  // Mock data for charts
  const chartData = [
    { name: 'Jan', value: 2400, growth: 12 },
    { name: 'Feb', value: 1398, growth: -8 },
    { name: 'Mar', value: 9800, growth: 15 },
    { name: 'Apr', value: 3908, growth: 22 },
    { name: 'May', value: 4800, growth: 8 },
    { name: 'Jun', value: 3800, growth: 18 },
  ];

  const engagementData = [
    { name: 'Mon', likes: 120, comments: 45, shares: 12 },
    { name: 'Tue', likes: 150, comments: 52, shares: 18 },
    { name: 'Wed', likes: 180, comments: 67, shares: 22 },
    { name: 'Thu', likes: 220, comments: 89, shares: 31 },
    { name: 'Fri', likes: 290, comments: 112, shares: 45 },
    { name: 'Sat', likes: 350, comments: 134, shares: 52 },
    { name: 'Sun', likes: 280, comments: 98, shares: 38 },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here's what's happening with your social media accounts
        </p>
      </div>

      {/* Stats overview - Stripe-style cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-card hover:shadow-card-hover transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Connected Accounts</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {usage?.currentAccounts || 0}
                  <span className="text-lg text-gray-500 font-normal">/{usage?.maxAccounts || 0}</span>
                </p>
                <div className="flex items-center mt-2">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-success-500 mr-1" />
                  <span className="text-sm text-success-600 font-medium">+12%</span>
                  <span className="text-sm text-gray-500 ml-1">this month</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <UserGroupIcon className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card hover:shadow-card-hover transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reach</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">24.5K</p>
                <div className="flex items-center mt-2">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-success-500 mr-1" />
                  <span className="text-sm text-success-600 font-medium">+18%</span>
                  <span className="text-sm text-gray-500 ml-1">vs last week</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-success-100 rounded-lg flex items-center justify-center">
                <EyeIcon className="h-6 w-6 text-success-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card hover:shadow-card-hover transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">4.2%</p>
                <div className="flex items-center mt-2">
                  <ArrowTrendingDownIcon className="h-4 w-4 text-error-500 mr-1" />
                  <span className="text-sm text-error-600 font-medium">-2%</span>
                  <span className="text-sm text-gray-500 ml-1">vs last week</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-warning-100 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="h-6 w-6 text-warning-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card hover:shadow-card-hover transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Plan</p>
                <p className="text-3xl font-bold text-gray-900 mt-2 capitalize">
                  {((usage as any)?.tier) || 'Free'}
                </p>
                <div className="mt-2">
                  <Badge variant="primary" className="text-xs">
                    {(usage as any)?.canAddMore ? 'Active' : 'Limit Reached'}
                  </Badge>
                </div>
              </div>
              <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <span className="text-primary-600 font-bold text-lg">
                  {((usage as any)?.tier)?.charAt(0)?.toUpperCase() || 'F'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Growth Overview
              <Button variant="ghost" size="sm">
                View Details
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Button>
            </CardTitle>
            <CardDescription>
              Your account growth over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary-500)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-primary-500)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="var(--color-primary-500)" 
                    fillOpacity={1} 
                    fill="url(#colorGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Weekly Engagement
              <Button variant="ghost" size="sm">
                View Details
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Button>
            </CardTitle>
            <CardDescription>
              Likes, comments, and shares this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line type="monotone" dataKey="likes" stroke="var(--color-primary-500)" strokeWidth={2} dot={{ fill: 'var(--color-primary-500)', strokeWidth: 2, r: 4 }} />
                  <Line type="monotone" dataKey="comments" stroke="var(--color-success-500)" strokeWidth={2} dot={{ fill: 'var(--color-success-500)', strokeWidth: 2, r: 4 }} />
                  <Line type="monotone" dataKey="shares" stroke="var(--color-warning-500)" strokeWidth={2} dot={{ fill: 'var(--color-warning-500)', strokeWidth: 2, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section - Connected Accounts & Recent Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Connected Accounts */}
        <Card className="border-0 shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Connected Accounts</CardTitle>
                <CardDescription>Manage your social media connections</CardDescription>
              </div>
              {(usage as any)?.canAddMore && (
                <Button variant="outline" size="sm" asChild>
                  <Link to="/accounts">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add Account
                  </Link>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {(accounts?.length || 0) === 0 ? (
              <div className="text-center py-8">
                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserGroupIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  No accounts connected
                </h4>
                <p className="text-gray-600 mb-6">
                  Get started by connecting your first social media account.
                </p>
                <Button asChild>
                  <Link to="/accounts">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Connect Account
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {accounts?.slice(0, 3).map((account: any) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary-700">
                          {account.platform?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          @{account.username || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-500 capitalize">
                          {account.platform || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={account.isActive ? 'success' : 'destructive'}
                    >
                      {account.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ))}
                {(accounts?.length || 0) > 3 && (
                  <div className="text-center pt-4">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/accounts">
                        View all {accounts?.length || 0} accounts
                        <ArrowRightIcon className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

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