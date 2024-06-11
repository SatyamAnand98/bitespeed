// Path: src/helper/validators/contactCreation.validator.ts
import joi from "joi";

export const contactCreationValidator = joi
    .array()
    .items(
        joi
            .object({
                email: joi.string().email().optional().allow(null),
                phoneNumber: joi.string().optional().allow(null),
            })
            .or("email", "phoneNumber")
            .required()
    )
    .required();
