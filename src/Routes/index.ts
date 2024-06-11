// Path: src/Routes/index.ts
import { Request, Response, Router } from "express";
import { identify } from "../controller/checkIdentity";
import { dataCreation } from "../controller/dataCreation";

export const routes = Router();

routes.get("/", (req: Request, res: Response) => {
    res.json({
        msg: "Hello World! From Bitespeed!",
    });
});

routes.post("/identify/", identify);
routes.post("/create/", dataCreation.createData);
