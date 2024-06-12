// Path: src/helper/validators/identity.validator.ts

import Joi from "joi";

export const identityValidator = Joi.object({
    email: Joi.string().email().allow(null, "").empty("").default(null),
    phoneNumber: Joi.string().allow(null, "").empty("").default(null),
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
            "At least one of 'email' or 'phoneNumber' must be provided",
    });
