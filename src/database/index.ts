// Database utilities and helpers
import { QueryResult, PoolClient } from "pg";
import { pgPool } from "../database";

/**
 * Execute a database query with logging and error handling
 * @param text SQL query text
 * @param params Query parameters
 * @returns Query result rows
 */
export const query = async <T>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> => {
  // Use individual client connection to prevent hanging
  const client = await pgPool.connect();
  let result: QueryResult;
  try {
    result = await client.query(text, params);
  } finally {
    client.release();
  }
  return result.rows as T[];

  /* ORIGINAL CODE - COMMENTED OUT DUE TO HANGING:
  const start = Date.now();
  try {
    // Use the pool object to query
    const result: QueryResult = await pgPool.query(text, params);
    const duration = Date.now() - start;

    logger.debug('Executed query', {
      text,
      duration,
      rows: result.rowCount,
    });

    return result.rows as T[];
  } catch (error) {
    logger.error('Database query error', {
      text,
      error,
    });
    throw error;
  }
  */
};

/**
 * Execute a database transaction
 * @param callback Function that receives a client and executes queries
 * @returns Result of the callback function
 */
export const transaction = async <T>(
  callback: (client: PoolClient) => Promise<T>,
): Promise<T> => {
  const client = await pgPool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Execute a batch of queries in a single transaction
 * @param queries Array of query objects with text and params
 * @returns Array of query results
 */
export const batchQuery = async <T>(
  queries: { text: string; params?: unknown[] }[],
): Promise<T[][]> => {
  return transaction(async (client) => {
    const results: T[][] = [];
    for (const query of queries) {
      const result = await client.query(query.text, query.params || []);
      results.push(result.rows as T[]);
    }
    return results;
  });
};

/**
 * Create a parameterized IN clause for SQL queries
 * @param values Array of values for IN clause
 * @param startIndex Starting index for parameters
 * @returns Object with text and values
 */
export const createInClause = (
  values: unknown[],
  startIndex = 1,
): { text: string; values: unknown[] } => {
  if (!values.length) {
    return { text: "(NULL)", values: [] };
  }

  const params = values.map((_, i) => `$${startIndex + i}`);
  return {
    text: `(${params.join(", ")})`,
    values,
  };
};

/**
 * Build a dynamic WHERE clause based on filters
 * @param filters Object with column names and values
 * @param startIndex Starting index for parameters
 * @returns Object with clause text and values array
 */
export const buildWhereClause = (
  filters: Record<string, unknown>,
  startIndex = 1,
): { text: string; values: unknown[] } => {
  const clauses: string[] = [];
  const values: unknown[] = [];
  let paramIndex = startIndex;

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      clauses.push(`${key} IS NULL`);
    } else if (Array.isArray(value)) {
      if (value.length > 0) {
        const inClause = createInClause(value, paramIndex);
        clauses.push(`${key} IN ${inClause.text}`);
        values.push(...inClause.values);
        paramIndex += value.length;
      }
    } else {
      clauses.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
  });

  return {
    text: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
    values,
  };
};

/**
 * Build a pagination clause
 * @param page Page number (1-based)
 * @param limit Items per page
 * @param startIndex Starting index for parameters
 * @returns Object with clause text and values array
 */
export const buildPaginationClause = (
  page: number,
  limit: number,
  startIndex = 1,
): { text: string; values: unknown[] } => {
  const offset = (page - 1) * limit;
  return {
    text: `LIMIT $${startIndex} OFFSET $${startIndex + 1}`,
    values: [limit, offset],
  };
};

/**
 * Get the total count of rows matching a query
 * @param table Table name
 * @param whereClause Where clause object
 * @returns Total count
 */
export const getTotalCount = async (
  table: string,
  whereClause: { text: string; values: unknown[] } = { text: "", values: [] },
): Promise<number> => {
  const countQuery = `
    SELECT COUNT(*) as total
    FROM ${table}
    ${whereClause.text}
  `;

  const result = await query<{ total: string }>(countQuery, whereClause.values);
  return parseInt(result[0]?.total || "0", 10);
};

/**
 * Check if a record exists in the database
 * @param table Table name
 * @param conditions Object with column names and values
 * @returns Boolean indicating if record exists
 */
export const recordExists = async (
  table: string,
  conditions: Record<string, unknown>,
): Promise<boolean> => {
  const whereClause = buildWhereClause(conditions);
  const existsQuery = `
    SELECT EXISTS (
      SELECT 1 FROM ${table}
      ${whereClause.text}
    ) as exists
  `;

  const result = await query<{ exists: boolean }>(
    existsQuery,
    whereClause.values,
  );
  return result[0]?.exists || false;
};
