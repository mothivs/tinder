const express = require("express");
const { User } = require("../models/user.js")
const { redisClient } = require("../config/redis.js")

const router = express.Router()




//# CRUD Operations Logged In Routes
//#---------------------------------/


//^ Handles exactly: /user and for fetching all users
//# This is called cache aside pattern
router.get("/", async (req, res) => {
  const fullCacheUrlKey = `api:${req.originalUrl}`;
  try {
    const cachedUsers = await redisClient.get(fullCacheUrlKey);

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 10);
    const skip = (page-1) * limit;

    if (cachedUsers) {
      const users = JSON.parse(cachedUsers)
      console.log(`✅ Returning from Cache: ${fullCacheUrlKey}`, users)
      return res.status(200).json({
        success: true,
        count: users.length,
        data: users
      })
    }

    console.log(`❌ Cache miss:  ${fullCacheUrlKey}`)
    

    //# Not fool proof finish this off first.
    const users = await User.find({}).select("-password").skip(skip).limit(limit).lean();
    // 3. Save to Cache with an Expiration Time (e.g., 3600 seconds / 1 hour)
    // 'EX' sets the TTL so your data doesn't become permanently stale
    //^ 3600 - 1 hr TTL
    await redisClient.set(`api:${req.originalUrl}`, JSON.stringify(users), "EX", 3600);
    console.log(`💾 Data cached successfully for ${fullCacheUrlKey}`);

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    })
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }

});

/*
 * Duplicate Keys: If a query parameter is repeated (e.g., ?color=blue&color=red), 
 * Node.js frameworks typically parse it as an array: ['blue', 'red']. 
 * Always validate data types if you expect a single string string but get an array instead.
 * Query Params vs. Route Params: Do not confuse req.query with req.params.
 * req.params handles required identifiers explicitly built into the route path (e.g., /users/:id).
 * req.query handles optional modifiers after a ? (e.g., /users?id=123).‚
 */

//^ first time - 200 OK
//^ Second time - 304 Nothing Modified response
router.get("/search", (req, res) => {
  const name = req.query.name;
  const role = req.query.role;
  res.send(`User name ${name} with role ${role} is being searched`)
})



module.exports = router
