// Path: app.ts
import bodyParser from "body-parser";
import dotenv from "dotenv";
import express from "express";
import { routes } from "./src/Routes";
import db from "./src/database/";
import { ipTrackerMiddleware } from "./src/middleware/ip.tracker";

dotenv.config();

class App {
    public express: express.Application;
    private port: number = parseInt(process.env.PORT || "3000");

    constructor() {
        this.express = express();
        this.middleware();
        this.database();
        this.mountRoutes();
    }

    private middleware(): void {
        this.express.use(bodyParser.urlencoded({ extended: true }));
        this.express.use(bodyParser.json());
        this.express.use(ipTrackerMiddleware);
    }

    private database(): void {
        db.getPool();
    }

    private mountRoutes(): void {
        this.express.use("/", routes);
    }

    public start(): void {
        this.express.listen(this.port, () => {
            console.log(`Server started on port ${this.port}`);
        });
    }
}

const app = new App();
app.start();
