/**
 * Migration: Expand Post Data Schema
 * 
 * This migration expands the post_metrics table to capture rich data from Apify API
 * including hashtags, mentions, media metadata, and ownership information.
 * 
 * Based on Apify Instagram API response structure with fields like:
 * - inputUrl, url, type, shortCode, caption
 * - hashtags, mentions, commentsCount, firstComment, latestComments
 * - dimensionsHeight, dimensionsWidth, displayUrl, images, alt
 * - likesCount, timestamp, childPosts
 * - ownerFullName, ownerUsername, ownerId, isSponsored
 */

exports.up = (pgm) => {
  // Add new columns to post_metrics table to capture rich Apify data
  pgm.addColumns('post_metrics', {
    // URLs and identifiers
    input_url: { type: 'text', notNull: false, comment: 'Original input URL used for scraping' },
    post_url: { type: 'text', notNull: false, comment: 'Direct URL to the post' },
    short_code: { type: 'varchar(50)', notNull: false, comment: 'Instagram short code identifier' },
    
    // Content and metadata
    caption: { type: 'text', notNull: false, comment: 'Post caption/description' },
    alt_text: { type: 'text', notNull: false, comment: 'Alt text for accessibility' },
    post_type: { type: 'varchar(50)', notNull: false, comment: 'Type of post (Image, Video, Carousel, etc.)' },
    
    // Media dimensions and URLs
    dimensions_height: { type: 'integer', notNull: false, comment: 'Media height in pixels' },
    dimensions_width: { type: 'integer', notNull: false, comment: 'Media width in pixels' },
    display_url: { type: 'text', notNull: false, comment: 'Primary display image URL' },
    
    // Hashtags and mentions (stored as JSONB for efficient querying)
    hashtags: { type: 'jsonb', notNull: false, default: '[]', comment: 'Array of hashtags used in the post' },
    mentions: { type: 'jsonb', notNull: false, default: '[]', comment: 'Array of user mentions in the post' },
    
    // Comments data
    first_comment: { type: 'text', notNull: false, comment: 'First comment on the post' },
    latest_comments: { type: 'jsonb', notNull: false, default: '[]', comment: 'Recent comments data' },
    
    // Owner/Author information
    owner_full_name: { type: 'varchar(255)', notNull: false, comment: 'Full name of post author' },
    owner_username: { type: 'varchar(255)', notNull: false, comment: 'Username of post author' },
    owner_id: { type: 'varchar(100)', notNull: false, comment: 'Platform user ID of post author' },
    
    // Additional metadata
    is_sponsored: { type: 'boolean', notNull: false, default: false, comment: 'Whether the post is sponsored content' },
    child_posts: { type: 'jsonb', notNull: false, default: '[]', comment: 'Child posts for carousel content' },
    images: { type: 'jsonb', notNull: false, default: '[]', comment: 'Additional images in the post' },
    
    // Enhanced engagement metrics (keeping existing likes, comments, shares, views, etc.)
    // These will be populated from the rich API data
  });

  // Create indexes for efficient querying
  pgm.createIndex('post_metrics', 'hashtags', { method: 'gin', comment: 'Index for hashtag queries' });
  pgm.createIndex('post_metrics', 'mentions', { method: 'gin', comment: 'Index for mention queries' });
  pgm.createIndex('post_metrics', 'owner_username', { comment: 'Index for owner username queries' });
  pgm.createIndex('post_metrics', 'short_code', { unique: true, comment: 'Unique index for Instagram short codes' });
  pgm.createIndex('post_metrics', ['post_type', 'published_at'], { comment: 'Composite index for content type and date' });
  pgm.createIndex('post_metrics', 'is_sponsored', { comment: 'Index for sponsored content filtering' });

  // Add comments to existing columns for clarity
  pgm.sql(`
    COMMENT ON COLUMN post_metrics.likes IS 'Number of likes (mapped from likesCount in API)';
    COMMENT ON COLUMN post_metrics.comments IS 'Number of comments (mapped from commentsCount in API)';
    COMMENT ON COLUMN post_metrics.published_at IS 'When the post was published (mapped from timestamp in API)';
  `);
};

exports.down = (pgm) => {
  // Remove the indexes first
  pgm.dropIndex('post_metrics', 'is_sponsored');
  pgm.dropIndex('post_metrics', ['post_type', 'published_at']);
  pgm.dropIndex('post_metrics', 'short_code');
  pgm.dropIndex('post_metrics', 'owner_username');
  pgm.dropIndex('post_metrics', 'mentions');
  pgm.dropIndex('post_metrics', 'hashtags');

  // Remove the new columns
  pgm.dropColumns('post_metrics', [
    'input_url',
    'post_url', 
    'short_code',
    'caption',
    'alt_text',
    'post_type',
    'dimensions_height',
    'dimensions_width',
    'display_url',
    'hashtags',
    'mentions',
    'first_comment',
    'latest_comments',
    'owner_full_name',
    'owner_username',
    'owner_id',
    'is_sponsored',
    'child_posts',
    'images'
  ]);
};