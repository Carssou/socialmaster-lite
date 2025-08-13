// Generic repository for database operations
import { Pool, PoolClient } from "pg";
import { transaction, buildWhereClause, buildPaginationClause } from "./index";
import { PaginatedResult, QueryParams } from "../types";
import { pgPool } from "../database";

/**
 * Generic repository class for database operations
 * @template T The entity type
 */
export class Repository<T> {
  private pgPool: Pool;

  /**
   * Create a new repository
   * @param tableName The database table name
   * @param primaryKey The primary key column name
   */
  constructor(
    private readonly tableName: string,
    private readonly primaryKey: string = "id",
  ) {
    // Initialize pgPool once in constructor
    this.pgPool = pgPool;
  }

  /**
   * Convert camelCase to snake_case for database field names
   */
  private toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }

  /**
   * Convert object keys from camelCase to snake_case
   */
  private convertKeysToSnakeCase(
    obj: Record<string, any>,
  ): Record<string, any> {
    const converted: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      converted[this.toSnakeCase(key)] = value;
    }
    return converted;
  }

  /**
   * Find all entities with optional filtering, pagination, and sorting
   * @param params Query parameters for filtering, pagination, and sorting
   * @returns Paginated result with entities
   */
  async findAll(params?: QueryParams): Promise<PaginatedResult<T>> {
    const { pagination, filters, sort } = params || {};
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;

    // Build where clause
    const whereClause = filters
      ? buildWhereClause(filters)
      : { text: "", values: [] };

    // Build sort clause
    let sortClause = "";
    if (sort) {
      sortClause = `ORDER BY ${sort.field} ${sort.direction.toUpperCase()}`;
    }

    // Build pagination clause
    const paginationClause = buildPaginationClause(
      page,
      limit,
      whereClause.values.length + 1,
    );

    // Get total count using proper client connection
    const countQuery = `
      SELECT COUNT(*) as total
      FROM ${this.tableName}
      ${whereClause.text}
    `;
    const client = await this.pgPool.connect();
    let countResult, result;
    try {
      countResult = await client.query(countQuery, whereClause.values);
      const total = parseInt(countResult.rows[0].total, 10);

      // Build query
      const sql = `
        SELECT *
        FROM ${this.tableName}
        ${whereClause.text}
        ${sortClause}
        ${paginationClause.text}
      `;

      // Execute query using same client connection
      result = await client.query(sql, [
        ...whereClause.values,
        ...paginationClause.values,
      ]);
      const data = result.rows as T[];

      return {
        data,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } finally {
      client.release(); // CRITICAL: Always release in finally block
    }

    // This return statement is now inside the try block above
  }

  /**
   * Find an entity by its primary key
   * @param id The primary key value
   * @returns The entity or null if not found
   */
  async findById(id: string | number): Promise<T | null> {
    const sql = `
      SELECT *
      FROM ${this.tableName}
      WHERE ${this.primaryKey} = $1
    `;

    const client = await this.pgPool.connect();
    let result;
    try {
      result = await client.query(sql, [id]);
    } finally {
      client.release();
    }
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Find entities by a specific field value
   * @param field The field name
   * @param value The field value
   * @returns Array of matching entities
   */
  async findByField(field: string, value: unknown): Promise<T[]> {
    const sql = `
      SELECT *
      FROM ${this.tableName}
      WHERE ${field} = $1
    `;

    const client = await this.pgPool.connect();
    let result;
    try {
      result = await client.query(sql, [value]);
    } finally {
      client.release(); // CRITICAL: Always release in finally block
    }
    return result.rows as T[];
  }

  /**
   * Create a new entity
   * @param data The entity data
   * @returns The created entity
   */
  async create(data: Partial<T>): Promise<T> {
    // Convert camelCase keys to snake_case for database
    const dbData = this.convertKeysToSnakeCase(data as Record<string, any>);
    const fields = Object.keys(dbData);
    const values = Object.values(dbData);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");

    const sql = `
      INSERT INTO ${this.tableName} (${fields.join(", ")})
      VALUES (${placeholders})
      RETURNING *
    `;

    const client = await this.pgPool.connect();
    let result;
    try {
      result = await client.query(sql, values);
    } finally {
      client.release(); // CRITICAL: Always release in finally block
    }
    if (result.rows.length === 0) {
      throw new Error(`Failed to create entity in ${this.tableName}`);
    }
    return result.rows[0];
  }

  /**
   * Update an entity by its primary key
   * @param id The primary key value
   * @param data The fields to update
   * @returns The updated entity
   */
  async update(id: string | number, data: Partial<T>): Promise<T | null> {
    // Convert camelCase keys to snake_case for database
    const dbData = this.convertKeysToSnakeCase(data as Record<string, any>);
    const fields = Object.keys(dbData);
    const values = Object.values(dbData);

    if (fields.length === 0) {
      return this.findById(id);
    }

    const setClause = fields
      .map((field, i) => `${field} = $${i + 1}`)
      .join(", ");

    const sql = `
      UPDATE ${this.tableName}
      SET ${setClause}
      WHERE ${this.primaryKey} = $${fields.length + 1}
      RETURNING *
    `;

    const client = await this.pgPool.connect();
    let result;
    try {
      result = await client.query(sql, [...values, id]);
    } finally {
      client.release(); // CRITICAL: Always release in finally block
    }
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Delete an entity by its primary key
   * @param id The primary key value
   * @returns Boolean indicating if the entity was deleted
   */
  async delete(id: string | number): Promise<boolean> {
    const sql = `
      DELETE FROM ${this.tableName}
      WHERE ${this.primaryKey} = $1
      RETURNING ${this.primaryKey}
    `;

    const client = await this.pgPool.connect();
    let result;
    try {
      result = await client.query(sql, [id]);
    } finally {
      client.release(); // CRITICAL: Always release in finally block
    }
    return result.rows.length > 0;
  }

  /**
   * Count entities matching the given filters
   * @param filters Filter conditions
   * @returns Count of matching entities
   */
  async count(filters?: Record<string, any>): Promise<number> {
    const whereClause = filters
      ? buildWhereClause(filters)
      : { text: "", values: [] };

    const countQuery = `
      SELECT COUNT(*) as total
      FROM ${this.tableName}
      ${whereClause.text}
    `;
    const client = await this.pgPool.connect();
    let result;
    try {
      result = await client.query(countQuery, whereClause.values);
    } finally {
      client.release(); // CRITICAL: Always release in finally block
    }
    return parseInt(result.rows[0].total, 10);
  }

  /**
   * Check if an entity exists
   * @param conditions Conditions to check
   * @returns Boolean indicating if the entity exists
   */
  async exists(conditions: Record<string, any>): Promise<boolean> {
    const whereClause = buildWhereClause(conditions);
    const sql = `
      SELECT EXISTS (
        SELECT 1
        FROM ${this.tableName}
        ${whereClause.text}
      ) as exists
    `;

    const client = await this.pgPool.connect();
    let result;
    try {
      result = await client.query(sql, whereClause.values);
    } finally {
      client.release(); // CRITICAL: Always release in finally block
    }
    if (result.rows.length === 0) {
      return false;
    }
    return result.rows[0].exists;
  }

  /**
   * Execute a custom query
   * @param sql SQL query
   * @param params Query parameters
   * @returns Query result
   */
  async executeQuery<R = unknown>(
    sql: string,
    params: unknown[] = [],
  ): Promise<R[]> {
    // Use client connection to avoid hanging
    const client = await this.pgPool.connect();
    let result;
    try {
      result = await client.query(sql, params);
    } finally {
      client.release();
    }
    return result.rows as R[];
  }

  /**
   * Execute a transaction
   * @param callback Transaction callback
   * @returns Transaction result
   */
  async executeTransaction<R = unknown>(
    callback: (client: PoolClient) => Promise<R>,
  ): Promise<R> {
    return transaction<R>(callback);
  }
}
