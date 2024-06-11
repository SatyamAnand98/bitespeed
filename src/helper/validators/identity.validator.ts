// Path: src/helper/validators/identity.validator.ts

import Joi from "joi";

export const identityValidator = Joi.object({
    email: Joi.string().email().optional().allow(null),
    phoneNumber: Joi.string().optional().allow(null),
    // .valid({
    //     length: 10,
    //     pattern: /^[0-9]+$/,
    // }),
});
