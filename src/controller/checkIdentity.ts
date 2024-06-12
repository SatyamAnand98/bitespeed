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
            const { email, phone_number: phoneNumber } = data;
            const { query, params } = new NestedQueryBuilder()
                .setEmail(email)
                .setPhoneNumber(phoneNumber)
                .build();

            const initialResult = await pool.query(query, params);

            if (initialResult.rows.length === 0) {
                const insertQuery = `
                    INSERT INTO Contact (email, phone_number, linkPrecedence) 
                    VALUES ($1, $2, $3) RETURNING *
                `;
                const insertParams = [
                    email || null,
                    phoneNumber || null,
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

            let primaryContacts = allContacts.filter(
                (contact) => contact.linkprecedence === "primary"
            );

            const exactMatch = initialResult.rows.find(
                (row) => row.email === email && row.phone_number === phoneNumber
            );

            if (
                !exactMatch &&
                initialResult.rows.length > 0 &&
                primaryContacts.length === 1
            ) {
                // creating a new contact with the req data
                const insertQuery = `
                    INSERT INTO Contact (email, phone_number, linkPrecedence, linkedid) 
                    VALUES ($1, $2, $3, $4) RETURNING *
                `;

                const insertParams = [
                    email || null,
                    phoneNumber || null,
                    "secondary",
                    primaryContacts[0].id,
                ];

                const insertResult = await pool.query(
                    insertQuery,
                    insertParams
                );

                const newContact = insertResult.rows[0];
                allContacts.push(newContact);
            }

            if (primaryContacts.length > 1) {
                // updating contact whose phone_number is same as incoming request as secondary contact
                let secondaryContact = primaryContacts.find((contact) => {
                    return contact.email !== email;
                });

                secondaryContact.linkprecedence = "secondary";

                const primaryContactWithoutSecondary = primaryContacts.filter(
                    (contact) => contact.email === email
                );

                allContacts = [
                    secondaryContact,
                    ...primaryContactWithoutSecondary,
                    ...allContacts.filter(
                        (contact) => contact.linkprecedence !== "primary"
                    ),
                ];

                if (secondaryContact) {
                    const updateQuery = `
                        UPDATE Contact 
                        SET linkprecedence = 'secondary', linkedid = $1
                        WHERE id = $2
                    `;
                    await pool.query(updateQuery, [
                        primaryContactWithoutSecondary[0].id,
                        secondaryContact.id,
                    ]);
                }

                // removing secondaryContact from primaryContacts
                primaryContacts = primaryContacts.filter(
                    (contact) => contact.email === email
                );
            }

            const secondaryContacts = allContacts.filter(
                (contact) => contact.linkprecedence === "secondary"
            );

            const emails = new Set<string>();
            const phoneNumbers = new Set<string>();
            const secondaryContactIds = new Set<number>();

            primaryContacts.forEach((contact) => {
                emails.add(contact.email);
                phoneNumbers.add(contact.phone_number);
            });

            for (let contact of secondaryContacts) {
                if (contact.email) emails.add(contact.email);
                if (contact.phone_number)
                    phoneNumbers.add(contact.phone_number);
                secondaryContactIds.add(contact.id);
            }

            const responseObj: IResponse = {
                data: {
                    contact: {
                        primaryContactId: primaryContacts.map(
                            (contact) => contact.id
                        ),
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
            console.error("Error in identifying contact: ", error);
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
