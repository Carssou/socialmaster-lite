import { VALIDATION_LIMITS } from "../config/constants";

// Input sanitization and validation utilities

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Sanitize and validate Instagram username
 */
export function validateUsername(username: string): string {
  if (!username || typeof username !== "string") {
    throw new ValidationError("Username is required and must be a string");
  }

  const sanitized = username.trim().toLowerCase();

  if (sanitized.length === 0) {
    throw new ValidationError("Username cannot be empty");
  }

  if (sanitized.length > VALIDATION_LIMITS.MAX_USERNAME_LENGTH) {
    throw new ValidationError(
      `Username cannot exceed ${VALIDATION_LIMITS.MAX_USERNAME_LENGTH} characters`,
    );
  }

  // Instagram username validation
  if (!/^[a-zA-Z0-9._]+$/.test(sanitized)) {
    throw new ValidationError(
      "Username can only contain letters, numbers, dots, and underscores",
    );
  }

  return sanitized;
}

/**
 * Sanitize text content (captions, bios, etc.)
 */
export function sanitizeText(
  text: string | null | undefined,
  maxLength: number = VALIDATION_LIMITS.MAX_CAPTION_LENGTH,
): string {
  if (!text) return "";

  const sanitized = text.trim();

  if (sanitized.length > maxLength) {
    return sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Validate and sanitize hashtags array
 */
export function validateHashtags(hashtags: unknown): string[] {
  if (!hashtags) return [];

  if (!Array.isArray(hashtags)) {
    return [];
  }

  return hashtags
    .filter((tag): tag is string => typeof tag === "string")
    .filter((tag) => tag.trim().length > 0)
    .slice(0, VALIDATION_LIMITS.MAX_HASHTAGS_PER_POST);
}

/**
 * Validate and sanitize mentions array
 */
export function validateMentions(mentions: unknown): string[] {
  if (!mentions) return [];

  if (!Array.isArray(mentions)) {
    return [];
  }

  return mentions
    .filter((mention): mention is string => typeof mention === "string")
    .filter((mention) => mention.trim().length > 0)
    .slice(0, VALIDATION_LIMITS.MAX_MENTIONS_PER_POST);
}

/**
 * Validate numeric values with fallbacks
 */
export function validateNumber(value: unknown, fallback: number = 0): number {
  if (typeof value === "number" && !isNaN(value)) {
    return Math.max(0, Math.floor(value));
  }

  if (typeof value === "string") {
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed)) {
      return Math.max(0, parsed);
    }
  }

  return fallback;
}

/**
 * Validate and sanitize post timestamp
 */
export function validateTimestamp(timestamp: unknown): Date | null {
  if (!timestamp) return null;

  try {
    const date = new Date(timestamp as string | number | Date);
    if (isNaN(date.getTime())) {
      return null;
    }

    // Reject dates in the future or too far in the past (before Instagram existed)
    const now = new Date();
    const instagramLaunch = new Date("2010-10-01");

    if (date > now || date < instagramLaunch) {
      return null;
    }

    return date;
  } catch {
    return null;
  }
}

/**
 * Validate boolean values
 */
export function validateBoolean(
  value: unknown,
  fallback: boolean = false,
): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  return fallback;
}

/**
 * Validate and sanitize JSON data for database storage
 */
export function sanitizeJsonField<T>(data: unknown, fallback: T = [] as T): T {
  if (data === null || data === undefined) {
    return fallback;
  }

  try {
    // If it's already parsed, validate and return
    if (typeof data === "object") {
      return data as T;
    }

    // If it's a string, try to parse
    if (typeof data === "string") {
      return JSON.parse(data) as T;
    }

    return fallback;
  } catch {
    return fallback;
  }
}
