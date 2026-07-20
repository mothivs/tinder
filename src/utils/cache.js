const redisClient = require("./src/config/redis.js");

const cacheAPI = (req, res, next) => {
    const apiCacheKey = req.originalUrl;

    const cachedResponse = redisClient.get(apiCacheKey);
    if(cachedResponse){
        return res.status(200).json({success: true, message: "Details fetched successfully"})
    }
    
    next();
}

module.exports = cacheAPI