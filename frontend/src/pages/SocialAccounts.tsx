import React, { useEffect, useState } from 'react';
import { SocialAccount, AccountUsage, Platform } from '../types';
import apiClient from '../services/api';
import {
  PlusIcon,
  ArrowPathIcon,
  PencilIcon,
  UserGroupIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { TrashIcon } from '@heroicons/react/24/solid';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';

export const SocialAccounts: React.FC = () => {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [usage, setUsage] = useState<AccountUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [editingAccount, setEditingAccount] = useState<SocialAccount | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('=== SOCIAL ACCOUNTS PAGE: Loading data ===');
      const [accountsData, usageData] = await Promise.all([
        apiClient.getSocialAccounts(),
        apiClient.getAccountUsage(),
      ]);
      console.log('SOCIAL ACCOUNTS: Raw accounts data:', accountsData);
      console.log('SOCIAL ACCOUNTS: Raw usage data:', usageData);
      console.log('SOCIAL ACCOUNTS: Accounts length:', accountsData?.length);
      // Backend now returns proper camelCase, use directly
      setAccounts(accountsData || []);
      setUsage(usageData);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (accountId: string) => {
    if (!confirm('Are you sure you want to remove this account?')) {
      return;
    }

    try {
      await apiClient.deleteSocialAccount(accountId);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete account');
    }
  };

  const handleSync = async (accountId: string) => {
    try {
      await apiClient.syncAccountData(accountId);
      alert('Account data synced successfully!');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to sync account data');
    }
  };

  const handleEdit = async (updatedAccount: { username: string; displayName: string }) => {
    if (!editingAccount) return;
    
    try {
      await apiClient.updateSocialAccount(editingAccount.id, {
        username: updatedAccount.username,
        displayName: updatedAccount.displayName,
      });
      setEditingAccount(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update account');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Add Account button */}
      <div className="flex items-center justify-end">
        {usage?.canAddMore && (
          <Button onClick={() => alert('Account connection coming soon!')}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Connect Account
          </Button>
        )}
      </div>
      
      {/* Usage Card */}
      {usage && (
        <Card className="border-0 shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <UserGroupIcon className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Account Usage</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {usage?.currentAccounts || 0} of {usage?.maxAccounts || 0}
                  </p>
                  <p className="text-sm text-gray-500 capitalize">
                    {usage?.tier || 'Unknown'} Plan
                  </p>
                </div>
              </div>
              <div className="text-right">
                {usage?.canAddMore ? (
                  <Badge variant="success" className="mb-2">
                    <CheckBadgeIcon className="w-3 h-3 mr-1" />
                    Can Add More
                  </Badge>
                ) : (
                  <Badge variant="warning" className="mb-2">
                    <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                    Limit Reached
                  </Badge>
                )}
                {!usage?.canAddMore && (
                  <p className="text-xs text-gray-500 mt-1">
                    Upgrade to connect more accounts
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-error-200">
          <CardContent className="p-6">
            <div className="text-sm text-error-700">{error}</div>
            <Button
              variant="outline"
              onClick={loadData}
              className="mt-4"
            >
              Try again
            </Button>
          </CardContent>
        </Card>
      )}

      {(accounts?.length || 0) === 0 ? (
        <Card className="border-0 shadow-card">
          <CardContent className="p-12">
            <div className="text-center">
              <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserGroupIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No accounts connected
              </h3>
              <p className="text-gray-600 mb-6">
                Get started by connecting your first social media account.
              </p>
              <Button onClick={() => alert('Account connection coming soon!')}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Connect Account
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {accounts?.map((account) => (
            <Card key={account.id} className="border-0 shadow-card hover:shadow-card-hover transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary-700">
                        {account.platform?.charAt(0)?.toUpperCase() || 'I'}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          @{account.username}
                        </h3>
                        <Badge variant={account.isActive ? 'success' : 'destructive'}>
                          {account.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 capitalize">
                        {account.platform}
                        {account.displayName && ` • ${account.displayName}`}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Added {new Date(account.createdAt).toLocaleDateString()}
                        {account.lastSyncAt && (
                          <span>
                            {' '}• Last sync {new Date(account.lastSyncAt).toLocaleDateString()}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSync(account.id)}
                      title="Sync data"
                    >
                      <ArrowPathIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingAccount(account)}
                      title="Edit account"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(account.id)}
                      title="Remove account"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Account Modal */}
      {editingAccount && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 w-96">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Edit Account</CardTitle>
                <CardDescription>
                  Update your {editingAccount.platform} account details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    handleEdit({
                      username: formData.get('username') as string,
                      displayName: formData.get('displayName') as string,
                    });
                  }}
                  className="space-y-4"
                >
                  <Input
                    label="Username"
                    name="username"
                    id="username"
                    defaultValue={editingAccount.username}
                    required
                  />
                  
                  <Input
                    label="Display Name"
                    name="displayName"
                    id="displayName"
                    defaultValue={editingAccount.displayName}
                    required
                  />
                  
                  <div className="flex items-center justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditingAccount(null)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};