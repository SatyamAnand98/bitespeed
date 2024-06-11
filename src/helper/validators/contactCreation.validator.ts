// Path: src/helper/validators/contactCreation.validator.ts
import Joi from "joi";

export const contactCreationValidator = Joi.array()
    .items(
        Joi.object({
            email: Joi.string().email().allow(null, "").empty("").default(null),
            phone_number: Joi.string().allow(null, "").empty("").default(null),
        })
            .custom((value, helpers) => {
                const { email, phone_number } = value;
                if (!email && !phone_number) {
                    return helpers.error("any.required");
                }
                return value;
            }, "atLeastOne")
            .messages({
                "any.required":
                    "At least one of 'email' or 'phone_number' must be provided",
            })
    )
    .required()
    .min(1)
    .messages({
        "array.min": "At least one contact must be provided",
    });
