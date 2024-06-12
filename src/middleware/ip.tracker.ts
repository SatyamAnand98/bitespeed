import { Request, Response, NextFunction } from "express";
import db from "../database";

interface IPTracker {
    ip_address: string;
    count: number;
}

export async function ipTrackerMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const ip: string = req.ip as string;

    const existingIP = await db.query(
        `SELECT ip_address, count FROM IpAddress WHERE ip_address = '${ip}'`
    );

    let ipTracker: IPTracker;

    if (existingIP.rows.length > 0) {
        ipTracker = existingIP.rows[0];
        await db.query(
            `UPDATE IpAddress SET count = count + 1 WHERE ip_address = '${ip}'`
        );
    } else {
        await db.query(
            `INSERT INTO IpAddress (ip_address, count) VALUES ('${ip}', 1)`
        );

        ipTracker = {
            ip_address: ip,
            count: 1,
        };

        console.log("New IP address created: ", ipTracker);
    }

    next();
}
