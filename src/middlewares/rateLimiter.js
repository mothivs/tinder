const rateLimit = require("express-rate-limit")

const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-7', 
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        res.status(options.statusCode).json({
            status: 'fail',
            error: 'Too Many Requests',
            message: options.message,
            windowResetMinutes: 15
        });
    },
    //^keyGenerator: (req) => req.ip   //If not used rate-limit will use its inhouse ip generation
})

module.exports = rateLimiter;