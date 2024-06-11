// Path: src/database/index.ts
import { PostgreSQLConnection } from "./postgreSQL";

export class Database extends PostgreSQLConnection {
    private static instance: Database;

    private constructor() {
        super();
    }

    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
}

const db = Database.getInstance();
export default db;
