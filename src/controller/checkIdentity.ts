// Path: src/controller/checkIdentity.ts
import { Request, Response } from "express";
import db from "../database/";
import { NestedQueryBuilder } from "../helper/identity.queryBuilder";
import { IResponse } from "../store/interfaces/response.interface";
import { EHttpStatus } from "../store/enums/http.status.enum";
import { identityValidator } from "../helper/validators/identity.validator";

const pool = db.getPool();

export class Identity {
    static async identify(req: Request, res: Response) {
        try {
            const data = await identityValidator.validateAsync(req.body);
            const { email, phone_number } = data;
            const { query, params } = new NestedQueryBuilder()
                .setEmail(email)
                .setPhoneNumber(phone_number)
                .build();

            const initialResult = await pool.query(query, params);

            if (initialResult.rows.length === 0) {
                const insertQuery = `
                    INSERT INTO Contact (email, phone_number, linkPrecedence) 
                    VALUES ($1, $2, $3) RETURNING *
                `;
                const insertParams = [
                    email || null,
                    phone_number || null,
                    "primary",
                ];
                const insertResult = await pool.query(
                    insertQuery,
                    insertParams
                );

                const newContact = insertResult.rows[0];
                const responseObj: IResponse = {
                    data: {
                        contact: {
                            primaryContactId: newContact.id,
                            emails: [newContact.email].filter(Boolean),
                            phoneNumbers: [newContact.phone_number].filter(
                                Boolean
                            ),
                            secondaryContactIds: [],
                        },
                    },
                    status: EHttpStatus.OK,
                    message: "Contact identified",
                    meta: {
                        error: false,
                        message: "Contact identified",
                    },
                };

                return res.status(EHttpStatus.OK).json(responseObj);
            }

            const contactIds = new Set<number>(
                initialResult.rows.map((row) => row.id)
            );
            const linkedIds = new Set<number>(
                initialResult.rows.map((row) => row.linkedid).filter(Boolean)
            );
            let allContacts = [...initialResult.rows];

            while (linkedIds.size > 0) {
                const idArray = Array.from(linkedIds);
                linkedIds.clear();

                const relatedQuery = `
                    SELECT * FROM Contact 
                    WHERE id = ANY($1::int[])
                    OR linkedid = ANY($1::int[])
                `;
                const relatedResult = await pool.query(relatedQuery, [idArray]);

                for (const row of relatedResult.rows) {
                    if (!contactIds.has(row.id)) {
                        contactIds.add(row.id);
                        allContacts.push(row);

                        if (row.linkedid && !contactIds.has(row.linkedid)) {
                            linkedIds.add(row.linkedid);
                        }
                    }
                }
            }

            const primaryContact =
                allContacts.find(
                    (contact) => contact.linkprecedence === "primary"
                ) || allContacts[0];
            const secondaryContacts = allContacts.filter(
                (contact) => contact.linkprecedence === "secondary"
            );

            const emails = new Set<string>();
            const phoneNumbers = new Set<string>();
            const secondaryContactIds = new Set<number>();

            emails.add(primaryContact.email);
            phoneNumbers.add(primaryContact.phone_number);

            for (let contact of secondaryContacts) {
                if (contact.email) emails.add(contact.email);
                if (contact.phone_number)
                    phoneNumbers.add(contact.phone_number);
                secondaryContactIds.add(contact.id);
            }

            const responseObj: IResponse = {
                data: {
                    contact: {
                        primaryContactId: primaryContact.id,
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
}
