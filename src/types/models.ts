// Simplified models for Social Master Lite
import * as Types from "./index";

// User models
export interface User extends Types.User {}
export interface UserRegistrationDto extends Types.UserRegistrationDto {}
export interface UserLoginDto extends Types.UserLoginDto {}
export interface UserResponseDto extends Types.UserResponseDto {}
export interface AuthResponse extends Types.AuthResponse {}

// Tier models
export interface TierSettings extends Types.TierSettings {}
export interface TierLimits extends Types.TierLimits {}

// Social account models
export interface SocialAccount extends Types.SocialAccount {}
export interface SocialAccountDto extends Types.SocialAccountDto {}
export interface AccountUsageSummary extends Types.AccountUsageSummary {}

// Metrics models
export interface PostMetrics extends Types.PostMetrics {}
export interface AccountMetrics extends Types.AccountMetrics {}

// AI Analysis models
export interface AIAnalysis extends Types.AIAnalysis {}
export interface AIAnalysisDto extends Types.AIAnalysisDto {}

// Utility types
export interface PaginationParams extends Types.PaginationParams {}
export interface PaginatedResult<T> extends Types.PaginatedResult<T> {}
export interface FilterParams extends Types.FilterParams {}
export interface SortParams extends Types.SortParams {}
export interface QueryParams extends Types.QueryParams {}
export interface ApiResponse<T> extends Types.ApiResponse<T> {}

// Enums
export const UserTier = Types.UserTier;
export const Platform = Types.Platform;
export const InsightType = Types.InsightType;
export const InsightCategory = Types.InsightCategory;
export const PriorityLevel = Types.PriorityLevel;
export const ImpactLevel = Types.ImpactLevel;
export const UrgencyLevel = Types.UrgencyLevel;
