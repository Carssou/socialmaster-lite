import { ApifyClient } from "apify-client";

export interface InstagramPost {
  id: string;
  type: string;
  shortCode: string;
  caption: string;
  likesCount: number;
  url: string;
  displayUrl: string;
  timestamp: string;
  commentsCount: number;
}

export interface InstagramProfile {
  id: string;
  username: string;
  url: string;
  fullName: string;
  biography: string;
  followersCount: number;
  followsCount: number;
  postsCount: number;
  private: boolean;
  verified: boolean;
  profilePicUrl: string;
  profilePicUrlHD: string;
  latestPosts: InstagramPost[];
}

export type InstagramData = InstagramProfile[];

export class InstagramScraperError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "InstagramScraperError";
  }
}

export async function scrapeInstagramProfile(
  usernames: string | string[]
): Promise<InstagramData> {
  if (!process.env.APIFY_API_TOKEN) {
    throw new InstagramScraperError("APIFY_API_TOKEN is not configured");
  }

  const client = new ApifyClient({
    token: process.env.APIFY_API_TOKEN,
  });

  try {
    // Convert single username to array for consistent handling
    const usernameArray = Array.isArray(usernames) ? usernames : [usernames];

    // Create URLs for all usernames
    const input = {
      directUrls: usernameArray.map(
        (username) => `https://www.instagram.com/${username}/`
      ),
      resultsType: "details",
      resultsLimit: 1, // Keep 1 result per URL
      searchType: "user",
      searchLimit: 250,
      addParentData: false,
    };

    const run = await client.actor("shu8hvrXbJbY3Eb9W").call(input);

    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    if (!items || items.length === 0) {
      throw new InstagramScraperError(`No profiles found: ${usernames}`);
    }

    // Process all returned profiles
    return items.map((data: any) => {
      const posts = (data.latestPosts || []).slice(0, 12);

      // Calculate engagement metrics
      const totalLikes = posts.reduce(
        (sum: number, post: any) => sum + (post.likesCount || 0),
        0
      );
      const totalComments = posts.reduce(
        (sum: number, post: any) => sum + (post.commentsCount || 0),
        0
      );
      const avgLikes = Math.round(totalLikes / posts.length) || 0;
      const avgComments = Math.round(totalComments / posts.length) || 0;
      const engagementRate = data.followersCount
        ? Number(
            (((avgLikes + avgComments) / data.followersCount) * 100).toFixed(2)
          )
        : 0;

      // Format the data according to the expected structure
      return {
        id: data.id,
        username: data.username,
        url: data.url,
        fullName: data.fullName || data.username,
        biography: data.biography || "",
        followersCount: data.followersCount || 0,
        followsCount: data.followsCount || 0,
        postsCount: data.postsCount || 0,
        private: Boolean(data.private),
        verified: Boolean(data.verified),
        profilePicUrl: data.profilePicUrl || "",
        profilePicUrlHD: data.profilePicUrlHD || "",
        latestPosts: posts.map((post: any) => ({
          id: post.id,
          type: post.type,
          shortCode: post.shortCode,
          caption: post.caption || "",
          likesCount: post.likesCount || 0,
          url: post.url,
          displayUrl: post.displayUrl,
          timestamp: post.timestamp,
          commentsCount: post.commentsCount || 0,
        })),
      };
    });
  } catch (error) {
    if (error instanceof InstagramScraperError) {
      throw error;
    }
    throw new InstagramScraperError(
      "Failed to scrape Instagram profile",
      error
    );
  }
}
