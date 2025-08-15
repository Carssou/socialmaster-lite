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
        service.executeQuery("SELECT * FROM ai_analysis WHERE 1=1 UPDATE users SET password='hacked'")
      ).rejects.toThrow(ApiError);
      
      expect(mockExecuteQuery).not.toHaveBeenCalled();
    });

    it("should reject multiple statements", async () => {
      await expect(
        service.executeQuery("SELECT * FROM ai_analysis; SELECT * FROM users;")
      ).rejects.toThrow(ApiError);
      
      expect(mockExecuteQuery).not.toHaveBeenCalled();
    });

    it("should reject SQL injection via comments", async () => {
      await expect(
        service.executeQuery("SELECT * FROM ai_analysis -- comment\n; DROP TABLE users;")
      ).rejects.toThrow(ApiError);
      
      expect(mockExecuteQuery).not.toHaveBeenCalled();
    });

    it("should reject SQL injection via block comments", async () => {
      await expect(
        service.executeQuery("SELECT * /* comment */ FROM ai_analysis; DROP TABLE users;")
      ).rejects.toThrow(ApiError);
      
      expect(mockExecuteQuery).not.toHaveBeenCalled();
    });

    it("should reject INSERT INTO attempts", async () => {
      await expect(
        service.executeQuery("SELECT * FROM ai_analysis WHERE 1=1 INSERT INTO users VALUES('evil')")
      ).rejects.toThrow(ApiError);
      
      expect(mockExecuteQuery).not.toHaveBeenCalled();
    });

    it("should reject GRANT/REVOKE statements", async () => {
      await expect(
        service.executeQuery("SELECT * FROM ai_analysis WHERE 1=1 GRANT ALL PRIVILEGES ON users TO hacker")
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
        ["user-1", "30 days"]
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

    it("should handle executeAnalystFunction errors gracefully", async () => {
      const { LLMClientService } = require("../src/services/llm-client.service");
      const llmClient = new LLMClientService();
      
      // Access private method for testing
      const executeAnalystFunction = llmClient.executeAnalystFunction.bind(llmClient);
      
      const result = await executeAnalystFunction("nonexistentFunction", {});
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should handle invalid query parameters", async () => {
      // Test with null parameters
      await expect(
        service.executeQuery("SELECT * FROM ai_analysis WHERE user_id = $1", [null])
      ).rejects.toThrow();
    });
  });
});