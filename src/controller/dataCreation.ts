// Path: src/controller/dataCreation.ts
import { Request, Response } from "express";
import db from "../database/index";
import { contactCreationValidator } from "../helper/validators/contactCreation.validator";
import { IResponse } from "../store/interfaces/response.interface";
import { EHttpStatus } from "../store/enums/http.status.enum";
import { Pool } from "pg";

class DataCreation {
    // private pool: Pool;

    // constructor() {
    //     this.pool = db.getPool();
    // }

    public async createData(req: Request, res: Response) {
        try {
            const pool: Pool = db.getPool();
            const data = await contactCreationValidator.validateAsync(req.body);

            const responses = [];

            for (const contact of data) {
                const { email, phoneNumber } = contact;

                let query =
                    "SELECT * FROM Contact WHERE email = $1 OR phoneNumber = $2";
                const params = [email || null, phoneNumber || null];
                const result = await pool.query(query, params);

                const exactMatch = result.rows.find(
                    (row) =>
                        row.email === email && row.phoneNumber === phoneNumber
                );

                if (exactMatch) {
                    responses.push({
                        primaryContactId: exactMatch.linkedId || exactMatch.id,
                        emails: [exactMatch.email].filter(Boolean),
                        phoneNumbers: [exactMatch.phoneNumber].filter(Boolean),
                        secondaryContactIds:
                            exactMatch.linkPrecedence === "secondary"
                                ? [exactMatch.id]
                                : [],
                    });
                    continue;
                }

                let primaryContactId = null;
                let newContact = null;

                if (result.rows.length > 0) {
                    const primaryContact =
                        result.rows.find(
                            (row) => row.linkPrecedence === "primary"
                        ) || result.rows[0];
                    primaryContactId = primaryContact.id;

                    const insertQuery =
                        "INSERT INTO Contact (email, phoneNumber, linkedId, linkPrecedence) VALUES ($1, $2, $3, $4) RETURNING *";
                    const insertParams = [
                        email || null,
                        phoneNumber || null,
                        primaryContactId,
                        "secondary",
                    ];
                    const insertResult = await pool.query(
                        insertQuery,
                        insertParams
                    );
                    newContact = insertResult.rows[0];
                } else {
                    const insertQuery =
                        "INSERT INTO Contact (email, phoneNumber, linkPrecedence) VALUES ($1, $2, $3) RETURNING *";
                    const insertParams = [
                        email || null,
                        phoneNumber || null,
                        "primary",
                    ];
                    const insertResult = await pool.query(
                        insertQuery,
                        insertParams
                    );
                    newContact = insertResult.rows[0];
                    primaryContactId = newContact.id;
                }

                responses.push({
                    primaryContactId: primaryContactId,
                    emails: [newContact.email].filter(Boolean),
                    phoneNumbers: [newContact.phoneNumber].filter(Boolean),
                    secondaryContactIds:
                        newContact.linkPrecedence === "secondary"
                            ? [newContact.id]
                            : [],
                });
            }

            const responseObj: IResponse = {
                data: {
                    contacts: responses,
                },
                status: EHttpStatus.CREATED,
                message: "Contacts created successfully",
                meta: {
                    error: false,
                    message: "",
                },
            };

            res.status(201).json(responseObj);
        } catch (error: any) {
            console.error("Error creating data: ", error);
            const responseObj: IResponse = {
                data: null,
                status: error.status ?? EHttpStatus.INTERNAL_SERVER_ERROR,
                message: "Internal Server Error",
                meta: {
                    error: true,
                    message: error.message,
                },
            };
            res.status(error.status ?? EHttpStatus.INTERNAL_SERVER_ERROR).json(
                responseObj
            );
        }
    }
}

export const dataCreation = new DataCreation();
