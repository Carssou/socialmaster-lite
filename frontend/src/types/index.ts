// Frontend types matching backend API

export enum UserTier {
  FREE = "free",
  BASIC = "basic",
}

export enum Platform {
  TWITTER = "twitter",
  INSTAGRAM = "instagram",
  FACEBOOK = "facebook",
  LINKEDIN = "linkedin",
  TIKTOK = "tiktok",
  YOUTUBE = "youtube",
}

export enum InsightType {
  ENGAGEMENT_ANALYSIS = "engagement_analysis",
  GROWTH_TREND = "growth_trend",
  CONTENT_PERFORMANCE = "content_performance",
  AUDIENCE_BEHAVIOR = "audience_behavior",
  POSTING_OPTIMIZATION = "posting_optimization",
}

export enum InsightCategory {
  PERFORMANCE = "performance",
  GROWTH = "growth",
  CONTENT = "content",
  AUDIENCE = "audience",
  OPTIMIZATION = "optimization",
}

export enum PriorityLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum ImpactLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

export enum UrgencyLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

export interface User {
  id: string;
  email: string;
  name: string;
  tier: UserTier;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface SocialAccount {
  id: string;
  userId: string;
  platform: Platform;
  platformAccountId: string;
  username: string;
  displayName?: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: string;
  isActive: boolean;
  lastSyncAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSocialAccountRequest {
  platform: Platform;
  platformAccountId: string;
  username: string;
  displayName?: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: string;
}

export interface AccountMetrics {
  id?: string;
  socialAccountId?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  engagementRate: number;
  avgLikes: number;
  avgComments: number;
  avgShares?: number;
  avgViews?: number;
  lastUpdated?: string;
  postsAnalyzed?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AIInsight {
  id: string;
  socialAccountId: string;
  type: InsightType;
  category: InsightCategory;
  title: string;
  description: string;
  recommendation?: string;
  priority: PriorityLevel;
  impact: ImpactLevel;
  urgency: UrgencyLevel;
  confidence: number;
  dataPoints?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  isNew?: boolean; // Added to distinguish new vs previous insights
  userRating?: boolean | null; // User feedback: true=thumbs up, false=thumbs down, null=no rating
}

export interface TierLimits {
  tier: string;
  maxAccounts: number;
  description: string;
}

export interface AccountUsage {
  currentAccounts: number;
  maxAccounts: number;
  tier: string;
  canAddMore: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
}