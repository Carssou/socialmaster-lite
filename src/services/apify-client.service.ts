import { ApifyClient } from "apify-client";
import { logger } from "../logger";
import { APIFY_CONFIG } from "../config/constants";
import { validateUsername } from "../utils/validation";

/**
 * Service responsible only for Apify API interactions
 * Separated from data storage and business logic
 */
export class ApifyClientService {
  private client: ApifyClient;

  constructor() {
    if (!process.env.APIFY_API_TOKEN) {
      throw new Error("APIFY_API_TOKEN environment variable is not configured");
    }

    this.client = new ApifyClient({
      token: process.env.APIFY_API_TOKEN,
    });
  }

  /**
   * Execute Apify scrape for Instagram profile
   */
  async scrapeInstagramProfile(username: string): Promise<{
    runId: string;
    actorId: string;
    data: any;
  }> {
    // Validate input
    const validatedUsername = validateUsername(username);

    logger.info(`Starting Instagram scrape for username: ${validatedUsername}`);

    if (!process.env.APIFY_INSTAGRAM_ACTOR) {
      throw new Error(
        "APIFY_INSTAGRAM_ACTOR environment variable is not configured",
      );
    }

    const input = {
      directUrls: [`https://www.instagram.com/${validatedUsername}/`],
      resultsType: APIFY_CONFIG.DEFAULT_RESULTS_TYPE,
      resultsLimit: APIFY_CONFIG.DEFAULT_RESULTS_LIMIT,
      searchType: APIFY_CONFIG.DEFAULT_SEARCH_TYPE,
      searchLimit: APIFY_CONFIG.DEFAULT_SEARCH_LIMIT,
      addParentData: APIFY_CONFIG.DEFAULT_ADD_PARENT_DATA,
    };

    const run = await this.client
      .actor(process.env.APIFY_INSTAGRAM_ACTOR)
      .call(input);

    logger.info(
      `APIFY: Run completed with ID: ${run.id}, status: ${run.status}`,
    );

    const { items } = await this.client
      .dataset(run.defaultDatasetId)
      .listItems();

    logger.info(`APIFY: Retrieved ${items?.length || 0} items from dataset`);

    if (!items || items.length === 0) {
      throw new Error(`No profile found for username: ${validatedUsername}`);
    }

    const data = items[0] as any;

    if (items.length > 0 && items[0]) {
      logger.info(`APIFY: Profile data retrieved:`, {
        username: data.username,
        followersCount: data.followersCount,
        private: data.private,
        postsCount: data.postsCount,
        postsRetrieved: data.latestPosts?.length || 0,
      });
    }

    return {
      runId: run.id,
      actorId: process.env.APIFY_INSTAGRAM_ACTOR,
      data,
    };
  }

  /**
   * Validate Apify API configuration
   */
  validateConfiguration(): void {
    if (!process.env.APIFY_API_TOKEN) {
      throw new Error("APIFY_API_TOKEN is required");
    }
    if (!process.env.APIFY_INSTAGRAM_ACTOR) {
      throw new Error("APIFY_INSTAGRAM_ACTOR is required");
    }
  }
}
