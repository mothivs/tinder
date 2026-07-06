// rateLimiter.js
const {rateLimit, ipKeyGenerator} = require("express-rate-limit");

const createLimiter = (routeKey, minutes, maxRequests) => {
    return rateLimit({
        windowMs: minutes * 60 * 1000,
        limit: maxRequests,
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        
        keyGenerator: (req) => {
            // 1. Check if userAuth already found a logged-in user
            // 2. If not, look for the company's token header
            // 3. Fall back to the IP address if completely anonymous
            const userId = req.user?.id || req.user?._id; 
            
            //^With express-rate-limit@8.5.2, direct req.ip fallback can trigger an IPv6 warning 
            //^ and is weaker for IPv6 clients. Use ipKeyGenerator.
            const identifier = userId || ipKeyGenerator(req.ip);

            return `${routeKey}:${identifier}`;
        },
        
        handler: (req, res, next, options) => {
            res.status(options.statusCode).json({
                status: 'fail',
                error: 'Too Many Requests',
                message: options.message,
                windowResetMinutes: minutes
            });
        }
    });
};


const authLimiter    = createLimiter('auth', 60, 5);      // 5 requests per hour
const uploadLimiter  = createLimiter('uploads', 5, 10);    // 10 requests per 5 mins
const profileLimiter = createLimiter('profile', 15, 100);  // 100 requests per 15 mins

module.exports = {
    authLimiter,
    uploadLimiter,
    profileLimiter
};
