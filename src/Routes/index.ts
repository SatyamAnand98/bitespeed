// Path: src/Routes/index.ts
import { Request, Response, Router } from "express";
import { Identity } from "../controller/checkIdentity";
import { DataCreation } from "../controller/dataCreation";

export const routes = Router();

routes.get("/", (req: Request, res: Response) => {
    res.json({
        msg: "Hello World! From Bitespeed!",
    });
});

routes.post("/identify/", Identity.identify);
routes.post("/create/", DataCreation.createData);
