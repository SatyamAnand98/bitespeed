// Path: src/helper/validators/contactCreation.validator.ts
import Joi from "joi";

export const contactCreationValidator = Joi.array()
    .items(
        Joi.object({
            email: Joi.string().email().allow(null, "").empty("").default(null),
            phoneNumber: Joi.string().allow(null, "").empty("").default(null),
        })
            .custom((value, helpers) => {
                const { email, phoneNumber } = value;
                if (!email && !phoneNumber) {
                    return helpers.error("any.required");
                }
                return value;
            }, "atLeastOne")
            .messages({
                "any.required":
                    "At least one of 'email' or 'phoneNumber' must be provided",
            })
    )
    .required()
    .min(1)
    .messages({
        "array.min": "At least one contact must be provided",
    });
