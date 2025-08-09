import React, { useEffect, useState } from 'react';
import { SocialAccount, AccountUsage, Platform } from '../types';
import apiClient from '../services/api';
import {
  PlusIcon,
  TrashIcon,
  ArrowPathIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Social Accounts</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your connected social media accounts
            </p>
          </div>
          {usage?.canAddMore && (
            <button
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              onClick={() => alert('Account connection coming soon!')}
            >
              <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
              Connect Account
            </button>
          )}
        </div>
        
        {usage && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm text-blue-700">
              <strong>{usage?.currentAccounts || 0} of {usage?.maxAccounts || 0}</strong> accounts used
              ({usage?.tier?.toUpperCase() || 'UNKNOWN'} plan)
            </p>
            {!usage?.canAddMore && (
              <p className="text-xs text-blue-600 mt-1">
                Upgrade to connect more accounts
              </p>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
          <button
            onClick={loadData}
            className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
          >
            Try again
          </button>
        </div>
      )}

      {(accounts?.length || 0) === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
              />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No accounts connected
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by connecting your first social media account.
          </p>
          <div className="mt-6">
            <button
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              onClick={() => alert('Account connection coming soon!')}
            >
              <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
              Connect Account
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {accounts?.map((account) => (
              <li key={account.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-800">
                            {account.platform?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">
                            @{account.username}
                          </p>
                          <span
                            className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              account.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {account.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="mt-1">
                          <p className="text-sm text-gray-500 capitalize">
                            {account.platform}
                            {account.displayName && ` • ${account.displayName}`}
                          </p>
                          <p className="text-xs text-gray-400">
                            Added {new Date(account.createdAt).toLocaleDateString()}
                            {account.lastSyncAt && (
                              <span>
                                {' '}• Last sync {new Date(account.lastSyncAt).toLocaleDateString()}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleSync(account.id)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        title="Sync data"
                      >
                        <ArrowPathIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingAccount(account)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        title="Edit account"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(account.id)}
                        className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                        title="Remove account"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Edit Account Modal */}
      {editingAccount && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Edit Account
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  handleEdit({
                    username: formData.get('username') as string,
                    displayName: formData.get('displayName') as string,
                  });
                }}
              >
                <div className="mb-4">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    id="username"
                    defaultValue={editingAccount.username}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                    Display Name
                  </label>
                  <input
                    type="text"
                    name="displayName"
                    id="displayName"
                    defaultValue={editingAccount.displayName}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div className="flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setEditingAccount(null)}
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};