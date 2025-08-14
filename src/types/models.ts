// Simplified models for Social Master Lite
import * as Types from "./index";

// User models
export type User = Types.User;
export type UserRegistrationDto = Types.UserRegistrationDto;
export type UserLoginDto = Types.UserLoginDto;
export type UserResponseDto = Types.UserResponseDto;
export type AuthResponse = Types.AuthResponse;

// Tier models
export type TierSettings = Types.TierSettings;
export type TierLimits = Types.TierLimits;

// Social account models
export type SocialAccount = Types.SocialAccount;
export type SocialAccountDto = Types.SocialAccountDto;
export type AccountUsageSummary = Types.AccountUsageSummary;

// Metrics models
export type PostMetrics = Types.PostMetrics;
export type AccountMetrics = Types.AccountMetrics;

// AI Analysis models
export type AIAnalysis = Types.AIAnalysis;
export type AIAnalysisDto = Types.AIAnalysisDto;

// Utility types
export type PaginationParams = Types.PaginationParams;
export type PaginatedResult<T> = Types.PaginatedResult<T>;
export type FilterParams = Types.FilterParams;
export type SortParams = Types.SortParams;
export type QueryParams = Types.QueryParams;
export type ApiResponse<T> = Types.ApiResponse<T>;

// Enums
export const UserTier = Types.UserTier;
export const Platform = Types.Platform;
export const InsightType = Types.InsightType;
export const InsightCategory = Types.InsightCategory;
export const PriorityLevel = Types.PriorityLevel;
export const ImpactLevel = Types.ImpactLevel;
export const UrgencyLevel = Types.UrgencyLevel;
