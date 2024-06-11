// Path: src/database/postgreSQL.ts
import { Pool } from "pg";
import { createTable } from "../queries/tableCreation.queries";
import dotenv from "dotenv";

dotenv.config();

export class PostgreSQLConnection {
    private pool: Pool;

    protected constructor() {
        this.pool = new Pool({
            user:
                (process.env.PGUSER as string) ??
                (() => {
                    throw new Error("PGUSER is not defined");
                }),
            host:
                (process.env.PGHOST as string) ??
                (() => {
                    throw new Error("PGHOST is not defined");
                }),
            database:
                (process.env.PGDATABASE as string) ??
                (() => {
                    throw new Error("PGDATABASE is not defined");
                }),
            password:
                (process.env.PGPASSWORD as string) ??
                (() => {
                    throw new Error("PGPASSWORD is not defined");
                }),
            port: Number(process.env.PGPORT) ?? 5432,
            ssl: true,
        });

        this.createTables()
            .then(() => console.log("Tables created successfully"))
            .catch((error) => console.error("Error creating tables: ", error));

        this.pool.on("error", (err) => {
            console.error("Unexpected error on idle client", err);
            process.exit(-1);
        });

        console.log("✅ PostgreSQL Connection established successfully");
    }

    private async createTables(): Promise<void> {
        try {
            for (const query of Object.values(createTable)) {
                await this.pool.query(query);
            }
        } catch (error) {
            console.error("Error creating table: ", error);
        }
    }

    public getPool(): Pool {
        return this.pool;
    }

    public async closePool(): Promise<void> {
        await this.pool.end();
        console.log("✅ PostgreSQL Connection closed successfully");
    }

    public async query(query: string): Promise<any> {
        return this.pool.query(query);
    }

    public async queryWithParams(query: string, params: any[]): Promise<any> {
        return this.pool.query(query, params);
    }

    public async transaction(queries: string[]): Promise<void> {
        const client = await this.pool.connect();

        try {
            await client.query("BEGIN");
            for (const query of queries) {
                await client.query(query);
            }
            await client.query("COMMIT");
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }
}
