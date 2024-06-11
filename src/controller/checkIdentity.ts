// Path: src/controller/checkIdentity.ts
import { Request, Response } from "express";
import db from "../database/";
import { identityQueryBuilder } from "../helper/identity.queryBuilder";
import { IResponse } from "../store/interfaces/response.interface";
import { EHttpStatus } from "../store/enums/http.status.enum";
import { identityValidator } from "../helper/validators/identity.validator";

const pool = db.getPool();

export async function identify(req: Request, res: Response) {
    try {
        let data = await identityValidator.validateAsync(req.body);
        const { email, phoneNumber } = data;

        const { query, params } = identityQueryBuilder
            .setEmail(email)
            .setPhoneNumber(phoneNumber)
            .build();

        const result = await pool.query(query, params);

        if (result.rows.length === 0) {
            const insertQuery =
                "INSERT INTO Contact (email, phoneNumber, linkPrecedence) VALUES ($1, $2, $3) RETURNING *";
            const insertParams = [
                email || null,
                phoneNumber || null,
                "primary",
            ];
            const insertResult = await pool.query(insertQuery, insertParams);

            const newContact = insertResult.rows[0];
            return res.status(200).json({
                contact: {
                    primaryContatctId: newContact.id,
                    emails: [newContact.email].filter(Boolean),
                    phoneNumbers: [newContact.phoneNumber].filter(Boolean),
                    secondaryContactIds: [],
                },
            });
        }

        const primaryContact = result.rows.find(
            (row) => row.linkprecedence === "primary"
        );
        const secondaryContacts = result.rows.filter(
            (row) => row.linkprecedence === "secondary"
        );

        let emails = new Set();
        let phoneNumbers = new Set();
        let secondaryContactIds = new Set();

        if (primaryContact) {
            emails.add(primaryContact.email);
            phoneNumbers.add(primaryContact.phoneNumber);
        }

        for (let contact of secondaryContacts) {
            emails.add(contact.email);
            phoneNumbers.add(contact.phoneNumber);
            secondaryContactIds.add(contact.id);
        }

        const responseObj: IResponse = {
            data: {
                contact: {
                    primaryContatctId: primaryContact.id,
                    emails: Array.from(emails).filter(Boolean),
                    phoneNumbers: Array.from(phoneNumbers).filter(Boolean),
                    secondaryContactIds: Array.from(secondaryContactIds),
                },
            },
            status: EHttpStatus.OK,
            message: "Contact identified",
            meta: {
                error: false,
                message: "Contact identified",
            },
        };

        res.status(EHttpStatus.OK).json(responseObj);
    } catch (error: any) {
        console.error("Error in identifying contact: ", error.message);
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
