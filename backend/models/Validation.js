const { body, validationResult } = require('express-validator');

const validateFunc = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        res.status(400).json({
            status: "Error",
            errors: errors.array()
        });
    };
};

module.exports = validateFunc