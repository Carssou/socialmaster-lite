import { describe, it, expect, beforeAll } from "@jest/globals";
import { LLMAnalystQueryService } from "../src/services/llm-analyst-query.service";
import { Repository } from "../src/database/repository";
import { ApiError } from "../src/utils/errors";

// Mock the repository
jest.mock("../src/database/repository");
const mockRepo = Repository as jest.MockedClass<typeof Repository>;

describe("LLMAnalystQueryService", () => {
  let service: LLMAnalystQueryService;
  let mockExecuteQuery: jest.Mock;

  beforeAll(() => {
    // Setup mock
    mockExecuteQuery = jest.fn();
    mockRepo.prototype.executeQuery = mockExecuteQuery;
    
    service = new LLMAnalystQueryService();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Security - Whitelist validation", () => {
    it("should reject non-whitelisted queries", async () => {
      await expect(
        service.executeWhitelistedQuery("malicious_query", {})
      ).rejects.toThrow(ApiError);
      
      expect(mockExecuteQuery).not.toHaveBeenCalled();
    });

    it("should reject invalid parameters for whitelisted queries", async () => {
      await expect(
        service.executeWhitelistedQuery("recent_analyses", { maliciousParam: "value" })
      ).rejects.toThrow(ApiError);
      
      expect(mockExecuteQuery).not.toHaveBeenCalled();
    });

    it("should reject dangerous characters in string parameters", async () => {
      await expect(
        service.executeWhitelistedQuery("search_analyses", { 
          keywords: "test; DROP TABLE users;--", 
          limit: 10 
        })
      ).rejects.toThrow(ApiError);
      
      expect(mockExecuteQuery).not.toHaveBeenCalled();
    });

    it("should reject excessively long string parameters", async () => {
      const longString = "a".repeat(1001);
      await expect(
        service.executeWhitelistedQuery("search_analyses", { 
          keywords: longString, 
          limit: 10 
        })
      ).rejects.toThrow(ApiError);
      
      expect(mockExecuteQuery).not.toHaveBeenCalled();
    });

    it("should reject limits exceeding maximum", async () => {
      await expect(
        service.executeWhitelistedQuery("recent_analyses", { 
          userId: "user-1",
          days: 30,
          limit: 999999
        })
      ).rejects.toThrow(ApiError);
      
      expect(mockExecuteQuery).not.toHaveBeenCalled();
    });

    it("should list available whitelisted queries", () => {
      const queries = service.getAvailableQueries();
      expect(queries).toContain("recent_analyses");
      expect(queries).toContain("account_analyses");
      expect(queries).toContain("search_analyses");
      expect(queries).toContain("count_user_analyses");
      expect(queries).toContain("count_account_analyses");
    });
  });

  describe("Whitelisted Query methods", () => {
    const mockResults = [
      {
        id: "test-id",
        user_id: "user-1", 
        title: "Test Insight",
        type: "performance_trend",
        score: 85
      }
    ];

    it("should get recent analyses for user", async () => {
      mockExecuteQuery.mockResolvedValue(mockResults);
      
      const result = await service.getRecentAnalyses("user-1", 30, 50);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResults);
      expect(result.count).toBe(1);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining("WHERE user_id = $1"), 
        ["user-1", "30 days", 50]
      );
    });

    it("should get account analyses", async () => {
      mockExecuteQuery.mockResolvedValue(mockResults);
      
      const result = await service.getAccountAnalyses("account-1", 30);
      
      expect(result.success).toBe(true);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining("WHERE social_account_id = $1"),
        ["account-1", 30]
      );
    });

    it("should search analyses by keywords", async () => {
      mockExecuteQuery.mockResolvedValue(mockResults);
      
      const result = await service.searchAnalyses("engagement", 20);
      
      expect(result.success).toBe(true);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining("ILIKE $1"),
        ["%engagement%", 20]
      );
    });

    it("should get top insights with mutual exclusion", async () => {
      mockExecuteQuery.mockResolvedValue(mockResults);
      
      // Should reject both userId and socialAccountId
      await expect(
        service.getTopInsights("user-1", "account-1", 10)
      ).rejects.toThrow(ApiError);
    });

    it("should get top insights by user", async () => {
      mockExecuteQuery.mockResolvedValue(mockResults);
      
      const result = await service.getTopInsights("user-1", undefined, 10);
      
      expect(result.success).toBe(true);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining("WHERE user_id = $1"),
        ["user-1", 10]
      );
    });

    it("should get analysis summary", async () => {
      const summaryData = [{
        total_analyses: 25,
        accounts_analyzed: 3,
        avg_score: 78.5,
        high_impact_count: 8
      }];
      
      mockExecuteQuery.mockResolvedValue(summaryData);
      
      const result = await service.getAnalysisSummary("user-1", 30);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(summaryData);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining("COUNT(*) as total_analyses"),
        ["user-1", "30 days"]
      );
    });

    it("should count user analyses", async () => {
      mockExecuteQuery.mockResolvedValue([{ count: 42 }]);
      
      const count = await service.countUserAnalyses("user-1");
      
      expect(count).toBe(42);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining("SELECT COUNT(*) as count"),
        ["user-1"]
      );
    });

    it("should count account analyses", async () => {
      mockExecuteQuery.mockResolvedValue([{ count: 15 }]);
      
      const count = await service.countAccountAnalyses("account-1");
      
      expect(count).toBe(15);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining("WHERE social_account_id = $1"),
        ["account-1"]
      );
    });
  });

  describe("Error handling", () => {
    it("should handle database errors gracefully", async () => {
      mockExecuteQuery.mockRejectedValue(new Error("Database connection failed"));
      
      await expect(
        service.getRecentAnalyses("user-1")
      ).rejects.toThrow(ApiError);
    });

    it("should handle empty count results", async () => {
      mockExecuteQuery.mockResolvedValue([]);
      
      const count = await service.countUserAnalyses("user-1");
      
      expect(count).toBe(0);
    });

    it("should handle null count results", async () => {
      mockExecuteQuery.mockResolvedValue([{ count: null }]);
      
      const count = await service.countAccountAnalyses("account-1");
      
      expect(count).toBe(0);
    });
  });
});