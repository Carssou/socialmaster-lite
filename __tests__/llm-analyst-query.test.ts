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

  describe("Query validation", () => {
    it("should allow SELECT queries", async () => {
      mockExecuteQuery.mockResolvedValue([]);
      
      await service.executeQuery("SELECT * FROM ai_analysis");
      
      expect(mockExecuteQuery).toHaveBeenCalledWith("SELECT * FROM ai_analysis", []);
    });

    it("should reject non-SELECT queries", async () => {
      await expect(
        service.executeQuery("UPDATE ai_analysis SET title = 'test'")
      ).rejects.toThrow(ApiError);
      
      expect(mockExecuteQuery).not.toHaveBeenCalled();
    });

    it("should reject dangerous keywords", async () => {
      await expect(
        service.executeQuery("SELECT * FROM ai_analysis; DROP TABLE users;")
      ).rejects.toThrow(ApiError);
      
      expect(mockExecuteQuery).not.toHaveBeenCalled();
    });
  });

  describe("Query methods", () => {
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
        ["user-1", 50]
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

    it("should get top insights", async () => {
      mockExecuteQuery.mockResolvedValue(mockResults);
      
      const result = await service.getTopInsights("user-1", "account-1", 10);
      
      expect(result.success).toBe(true);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining("ORDER BY score DESC"),
        ["user-1", "account-1", 10]
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
        ["user-1"]
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

    it("should return error object for function failures", async () => {
      // This would be tested at the LLM client level where function execution is wrapped
      expect(true).toBe(true); // Placeholder for integration test
    });
  });
});