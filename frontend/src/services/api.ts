import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  SocialAccount,
  CreateSocialAccountRequest,
  AccountMetrics,
  AIInsight,
  TierLimits,
  AccountUsage,
  ApiResponse,
  ApiError,
} from '../types';


class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    console.log('API Client: Constructor called - initializing');
    this.client = axios.create({
      baseURL: 'http://localhost:3000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Load tokens from localStorage on initialization
    this.loadTokens();

    // Request interceptor to add auth header
    this.client.interceptors.request.use(
      (config) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Don't retry auth endpoints or if already retried
        if (error.response?.status === 401 && 
            !originalRequest._retry && 
            !originalRequest.url?.includes('/auth/')) {
          originalRequest._retry = true;

          try {
            await this.refreshAccessToken();
            return this.client(originalRequest);
          } catch (refreshError) {
            this.clearTokens();
            // Only redirect if not already on login page
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private loadTokens(): void {
    console.log('API Client: Loading tokens from localStorage');
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
    console.log('API Client: Access token exists:', !!this.accessToken);
    console.log('API Client: Refresh token exists:', !!this.refreshToken);
  }

  private saveTokens(accessToken: string, refreshToken: string): void {
    console.log('API Client: Saving tokens to localStorage');
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    console.log('API Client: Tokens saved successfully');
  }

  private clearTokens(): void {
    console.log('API Client: Clearing tokens from localStorage');
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  // Health check
  async health(): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.client.get('/health');
    return response.data;
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<ApiResponse<AuthResponse>> = await this.client.post(
        '/auth/login',
        credentials
      );
      
      const authData = response.data.data!;
      this.saveTokens(authData.accessToken, authData.refreshToken);
      
      return authData;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Login failed');
      }
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<ApiResponse<AuthResponse>> = await this.client.post(
        '/auth/register',
        userData
      );
      
      const authData = response.data.data!;
      this.saveTokens(authData.accessToken, authData.refreshToken);
      
      return authData;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Registration failed');
      }
    }
  }

  async refreshAccessToken(): Promise<AuthResponse> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response: AxiosResponse<ApiResponse<AuthResponse>> = await this.client.post(
      '/auth/refresh',
      { refreshToken: this.refreshToken }
    );
    
    const authData = response.data.data!;
    this.saveTokens(authData.accessToken, authData.refreshToken);
    
    return authData;
  }

  logout(): void {
    this.clearTokens();
  }

  // User endpoints
  async getProfile(): Promise<User> {
    const response: AxiosResponse<ApiResponse<any>> = await this.client.get('/user/profile');
    console.log('API Client: getProfile response:', response.data);
    if (!response.data.data?.user) {
      throw new Error('No user data received');
    }
    return response.data.data.user;
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response: AxiosResponse<ApiResponse<any>> = await this.client.put(
      '/user/profile',
      userData
    );
    if (!response.data.data?.user) {
      throw new Error('No user data received');
    }
    return response.data.data.user;
  }

  // Social accounts endpoints
  async getSocialAccounts(): Promise<SocialAccount[]> {
    const response: AxiosResponse<ApiResponse<any>> = await this.client.get(
      '/social-accounts'
    );
    return response.data.data?.accounts || [];
  }

  async createSocialAccount(accountData: CreateSocialAccountRequest): Promise<SocialAccount> {
    const response: AxiosResponse<ApiResponse<SocialAccount>> = await this.client.post(
      '/social-accounts',
      accountData
    );
    if (!response.data.data) {
      throw new Error('No account data received');
    }
    return response.data.data;
  }

  async getSocialAccount(accountId: string): Promise<SocialAccount> {
    const response: AxiosResponse<ApiResponse<SocialAccount>> = await this.client.get(
      `/social-accounts/${accountId}`
    );
    if (!response.data.data) {
      throw new Error('No account data received');
    }
    return response.data.data;
  }

  async updateSocialAccount(accountId: string, accountData: Partial<SocialAccount>): Promise<SocialAccount> {
    const response: AxiosResponse<ApiResponse<SocialAccount>> = await this.client.put(
      `/social-accounts/${accountId}`,
      accountData
    );
    if (!response.data.data) {
      throw new Error('No account data received');
    }
    return response.data.data;
  }

  async deleteSocialAccount(accountId: string): Promise<void> {
    await this.client.delete(`/social-accounts/${accountId}`);
  }

  async getAccountUsage(): Promise<AccountUsage> {
    const response: AxiosResponse<ApiResponse<AccountUsage>> = await this.client.get(
      '/social-accounts/usage'
    );
    if (!response.data.data) {
      throw new Error('No usage data received');
    }
    return response.data.data;
  }

  // Analytics endpoints
  async getAccountMetrics(accountId: string): Promise<AccountMetrics[]> {
    const response: AxiosResponse<ApiResponse<{ metrics: AccountMetrics[], insights: any[], summary: any }>> = await this.client.get(
      `/analytics/accounts/${accountId}/metrics`
    );
    return response.data.data?.metrics || [];
  }

  async getAccountMetricsAndInsights(accountId: string): Promise<{ metrics: AccountMetrics[], insights: any[] }> {
    const response: AxiosResponse<ApiResponse<{ metrics: AccountMetrics[], insights: any[], summary: any }>> = await this.client.get(
      `/analytics/accounts/${accountId}/metrics`
    );
    return {
      metrics: response.data.data?.metrics || [],
      insights: response.data.data?.insights || []
    };
  }

  async syncAccountData(accountId: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.client.post(
      `/analytics/accounts/${accountId}/sync`
    );
    return response.data;
  }

  async getAIInsights(accountId: string, forceRefresh: boolean = false): Promise<AIInsight[]> {
    const url = forceRefresh 
      ? `/analytics/accounts/${accountId}/insights?forceRefresh=true`
      : `/analytics/accounts/${accountId}/insights`;
    
    const response: AxiosResponse<ApiResponse<AIInsight[]>> = await this.client.get(url);
    return response.data.data || [];
  }

  async rateInsight(insightId: string, rating: boolean | null): Promise<void> {
    await this.client.put(`/analytics/insights/${insightId}/rating`, { rating });
  }

  async getDashboardData(): Promise<{
    accounts: SocialAccount[];
    recentMetrics: AccountMetrics[];
    insights: AIInsight[];
    usage: AccountUsage;
  }> {
    const response: AxiosResponse<ApiResponse<any>> = await this.client.get(
      '/analytics/dashboard'
    );
    if (!response.data.data) {
      throw new Error('No dashboard data received');
    }
    return response.data.data;
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  async handleApiError(error: any): Promise<never> {
    if (error.response?.data) {
      const apiError: ApiError = error.response.data;
      throw new Error(apiError.message || 'An API error occurred');
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('An unknown error occurred');
    }
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();
export default apiClient;