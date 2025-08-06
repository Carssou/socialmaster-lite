// Type definitions for Social Master Lite

// User tiers (simplified)
export enum UserTier {
  FREE = 'free',
  BASIC = 'basic',
}

// Social media platforms
export enum Platform {
  TWITTER = 'twitter',
  INSTAGRAM = 'instagram',
  FACEBOOK = 'facebook',
  LINKEDIN = 'linkedin',
  TIKTOK = 'tiktok',
  YOUTUBE = 'youtube',
}

// AI insight types
export enum InsightType {
  ENGAGEMENT_ANALYSIS = 'engagement_analysis',
  GROWTH_TREND = 'growth_trend',
  CONTENT_PERFORMANCE = 'content_performance',
  AUDIENCE_BEHAVIOR = 'audience_behavior',
  POSTING_OPTIMIZATION = 'posting_optimization',
}

// AI insight categories
export enum InsightCategory {
  PERFORMANCE = 'performance',
  GROWTH = 'growth',
  CONTENT = 'content',
  AUDIENCE = 'audience',
  OPTIMIZATION = 'optimization',
}

// AI insight priority levels
export enum PriorityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Impact levels for insights
export enum ImpactLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

// Urgency levels for insights
export enum UrgencyLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

// Base model with common fields
export interface BaseModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// User interface (simplified)
export interface User extends BaseModel {
  email: string;
  name: string;
  passwordHash: string;
  tier: UserTier;
  isActive: boolean;
  emailVerified: boolean;
}

// User registration DTO (simplified)
export interface UserRegistrationDto {
  email: string;
  password: string;
  name: string;
}

// User login DTO
export interface UserLoginDto {
  email: string;
  password: string;
}

// User response DTO (excludes sensitive information)
export interface UserResponseDto {
  id: string;
  email: string;
  name: string;
  tier: UserTier;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Authentication response
export interface AuthResponse {
  user: UserResponseDto;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Tier settings interface
export interface TierSettings extends BaseModel {
  tier: string;
  maxAccounts: number;
  description: string;
  isActive: boolean;
}

// Tier limits response
export interface TierLimits {
  tier: string;
  maxAccounts: number;
  description: string;
}

// Social media account interface (simplified)
export interface SocialAccount extends BaseModel {
  userId: string;
  platform: Platform;
  platformAccountId: string;
  username: string;
  displayName?: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  permissions?: string[];
  isActive: boolean;
  lastSyncAt?: Date;
}

// Social account creation DTO
export interface SocialAccountDto {
  platform: Platform;
  platformAccountId: string;
  username: string;
  displayName?: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  permissions?: string[];
}

// Account usage summary
export interface AccountUsageSummary {
  currentAccounts: number;
  maxAccounts: number;
  tier: string;
  canAddMore: boolean;
}

// Account metrics interface
export interface AccountMetrics extends BaseModel {
  socialAccountId: string;
  date: Date;
  followers: number;
  following: number;
  totalPosts: number;
  avgEngagementRate: number;
  reachGrowth: number;
  followerGrowth: number;
  collectedAt: Date;
}

// Post metrics interface
export interface PostMetrics extends BaseModel {
  socialAccountId: string;
  platform: Platform;
  platformPostId: string;
  publishedAt: Date;
  likes: number;
  shares: number;
  comments: number;
  views: number;
  reach: number;
  impressions: number;
  engagementRate: number;
  clickThroughRate?: number;
  collectedAt: Date;
}

// AI Analysis interface (simplified)
export interface AIAnalysis extends BaseModel {
  userId: string;
  socialAccountId?: string;
  type: InsightType;
  category: InsightCategory;
  title: string;
  description: string;
  insights: string[];
  recommendations: string[];
  confidence: number;
  impact: ImpactLevel;
  urgency: UrgencyLevel;
  priority: PriorityLevel;
  score: number;
  isActive: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  validUntil?: Date;
  supportingData?: Record<string, any>;
  generationMetadata?: Record<string, any>;
}

// AI Analysis creation DTO
export interface AIAnalysisDto {
  socialAccountId?: string;
  type: InsightType;
  category: InsightCategory;
  title: string;
  description: string;
  insights: string[];
  recommendations: string[];
  confidence: number;
  impact: ImpactLevel;
  urgency: UrgencyLevel;
  supportingData?: Record<string, any>;
  generationMetadata?: Record<string, any>;
}

// Pagination parameters
export interface PaginationParams {
  page: number;
  limit: number;
}

// Pagination result
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Filter parameters for queries
export interface FilterParams {
  startDate?: Date;
  endDate?: Date;
  platforms?: Platform[];
  [key: string]: any;
}

// Sort parameters
export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

// Query parameters combining pagination, filtering and sorting
export interface QueryParams {
  pagination?: PaginationParams;
  filters?: FilterParams;
  sort?: SortParams;
}

// API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: Record<string, any>;
}