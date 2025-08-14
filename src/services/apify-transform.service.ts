import {
  validateNumber,
  validateBoolean,
  validateTimestamp,
  sanitizeText,
  validateHashtags,
  validateMentions,
  sanitizeJsonField,
} from "../utils/validation";
import { VALIDATION_LIMITS } from "../config/constants";
import { InstagramProfile, InstagramPost, ApifyPostDB } from "./apify.service";

/**
 * Service responsible for transforming and validating Apify data
 * Separates data transformation concerns from API calls and storage
 */
export class ApifyTransformService {
  /**
   * Transform raw Apify data to typed InstagramProfile format
   */
  transformApifyDataToProfile(rawData: any): InstagramProfile {
    const posts = rawData.latestPosts || [];

    return {
      id: sanitizeText(rawData.id || ""),
      username: sanitizeText(rawData.username || ""),
      url: sanitizeText(rawData.url || ""),
      fullName: sanitizeText(
        rawData.fullName || rawData.username || "",
        VALIDATION_LIMITS.MAX_BIO_LENGTH,
      ),
      biography: sanitizeText(
        rawData.biography || "",
        VALIDATION_LIMITS.MAX_BIO_LENGTH,
      ),
      followersCount: validateNumber(rawData.followersCount),
      followsCount: validateNumber(rawData.followsCount),
      postsCount: validateNumber(rawData.postsCount),
      private: validateBoolean(rawData.private),
      verified: validateBoolean(rawData.verified),
      profilePicUrl: sanitizeText(rawData.profilePicUrl || ""),
      profilePicUrlHD: sanitizeText(
        rawData.profilePicUrlHD || rawData.profilePicUrl || "",
      ),
      latestPosts: posts.map((post: any) => this.transformPost(post)),
    };
  }

  /**
   * Transform individual post data with validation
   */
  private transformPost(post: any): InstagramPost {
    return {
      id: sanitizeText(post.id || ""),
      type: sanitizeText(post.type || "Image"),
      shortCode: sanitizeText(post.shortCode || ""),
      caption: sanitizeText(
        post.caption || "",
        VALIDATION_LIMITS.MAX_CAPTION_LENGTH,
      ),
      likesCount: validateNumber(post.likesCount),
      url: sanitizeText(post.url || ""),
      displayUrl: sanitizeText(post.displayUrl || ""),
      timestamp: post.timestamp || "",
      commentsCount: validateNumber(post.commentsCount),
      // Rich data fields
      inputUrl: sanitizeText(post.inputUrl || ""),
      hashtags: validateHashtags(post.hashtags),
      mentions: validateMentions(post.mentions),
      dimensionsHeight: validateNumber(post.dimensionsHeight),
      dimensionsWidth: validateNumber(post.dimensionsWidth),
      images: sanitizeJsonField(post.images, []),
      alt: sanitizeText(post.alt || ""),
      firstComment: sanitizeText(post.firstComment || ""),
      latestComments: sanitizeJsonField(post.latestComments, []),
      ownerFullName: sanitizeText(post.ownerFullName || ""),
      ownerUsername: sanitizeText(post.ownerUsername || ""),
      ownerId: sanitizeText(post.ownerId || ""),
      isSponsored: validateBoolean(post.isSponsored),
      childPosts: sanitizeJsonField(post.childPosts, []),
    };
  }

  /**
   * Prepare profile data for database storage
   */
  prepareProfileDataForStorage(rawData: any) {
    return {
      id: sanitizeText(rawData.id || ""),
      url: sanitizeText(rawData.url || ""),
      fbid: sanitizeText(rawData.fbid || ""),
      private: validateBoolean(rawData.private),
      fullName: sanitizeText(
        rawData.fullName || "",
        VALIDATION_LIMITS.MAX_BIO_LENGTH,
      ),
      inputUrl: sanitizeText(rawData.inputUrl || ""),
      username: sanitizeText(rawData.username || ""),
      verified: validateBoolean(rawData.verified),
      biography: sanitizeText(
        rawData.biography || "",
        VALIDATION_LIMITS.MAX_BIO_LENGTH,
      ),
      hasChannel: validateBoolean(rawData.hasChannel),
      postsCount: validateNumber(rawData.postsCount),
      followersCount: validateNumber(rawData.followersCount),
      followsCount: validateNumber(rawData.followsCount),
      profilePicUrl: sanitizeText(rawData.profilePicUrl || ""),
    };
  }

  /**
   * Prepare post data for database storage with validation
   */
  preparePostDataForStorage(post: any) {
    return {
      id: sanitizeText(post.id || ""),
      alt: sanitizeText(post.alt || ""),
      url: sanitizeText(post.url || ""),
      type: sanitizeText(post.type || "Image"),
      images: sanitizeJsonField(post.images, []),
      caption: sanitizeText(
        post.caption || "",
        VALIDATION_LIMITS.MAX_CAPTION_LENGTH,
      ),
      ownerId: sanitizeText(post.ownerId || ""),
      hashtags: validateHashtags(post.hashtags),
      isPinned: validateBoolean(post.isPinned),
      mentions: validateMentions(post.mentions),
      timestamp: validateTimestamp(post.timestamp),
      childPosts: sanitizeJsonField(post.childPosts, []),
      likesCount: validateNumber(post.likesCount),
      commentsCount: validateNumber(post.commentsCount),
      location: sanitizeJsonField(post.location, null),
      videoViewCount: validateNumber(post.videoViewCount),
      videoPlayCount: validateNumber(post.videoPlayCount),
      videoDurationMs: validateNumber(post.videoDurationMs),
      accessibility: sanitizeText(post.accessibility || ""),
      coauthorProducers: sanitizeJsonField(post.coauthorProducers, []),
      fundraiser: sanitizeJsonField(post.fundraiser, null),
      hasAudio: validateBoolean(post.hasAudio),
      isVideo: validateBoolean(post.isVideo),
      productType: sanitizeText(post.productType || ""),
    };
  }

  /**
   * Reconstruct InstagramProfile from stored ApifyPostDB data
   * Handles the data denormalization issue
   */
  reconstructProfileFromPosts(posts: ApifyPostDB[]): InstagramProfile {
    if (posts.length === 0) {
      throw new Error("Cannot reconstruct profile from empty posts array");
    }

    const firstPost = posts[0]!;

    return {
      id: firstPost.profile_id,
      username: firstPost.profile_username,
      url: firstPost.profile_url,
      fullName: firstPost.profile_full_name || firstPost.profile_username,
      biography: firstPost.profile_biography || "",
      followersCount: firstPost.profile_followers_count || 0,
      followsCount: firstPost.profile_follows_count || 0,
      postsCount: firstPost.profile_posts_count || 0,
      private: Boolean(firstPost.profile_private),
      verified: Boolean(firstPost.profile_verified),
      profilePicUrl: firstPost.profile_pic_url || "",
      profilePicUrlHD: firstPost.profile_pic_url || "",
      latestPosts: posts.map((post) => ({
        id: post.post_id,
        type: post.post_type || "Image",
        shortCode: "", // Not stored in current schema
        caption: post.post_caption || "",
        likesCount: post.post_likes_count || 0,
        url: post.post_url,
        displayUrl: "", // Not stored in current schema
        timestamp: post.post_timestamp ? post.post_timestamp.toISOString() : "",
        commentsCount: post.post_comments_count || 0,
        inputUrl: firstPost.profile_input_url,
        hashtags: post.post_hashtags || [],
        mentions: post.post_mentions || [],
        images: post.post_images || [],
        alt: post.post_alt || "",
        childPosts: post.post_child_posts || [],
        ownerId: post.post_owner_id,
      })),
    };
  }

  /**
   * Filter and prepare Apify data for optimized storage
   * Remove unnecessary fields to reduce storage overhead
   */
  filterApifyDataForStorage(rawData: any): any {
    return {
      // Profile fields - core data only
      ...this.prepareProfileDataForStorage(rawData),

      // Posts - filtered to essential data
      latestPosts: (rawData.latestPosts || []).map((post: any) =>
        this.preparePostDataForStorage(post),
      ),
    };
  }
}
