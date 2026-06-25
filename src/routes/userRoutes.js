const express = require("express");
const { User } = require("../models/user.js")
const userAuth = require("../middlewares/userAuth.js");
const { redisClient } = require("../config/redis.js")

const router = express.Router()




//# CRUD Operations Logged In Routes
//#---------------------------------/


//^ Handles exactly: /user and for fetching all users
router.get("/", userAuth, async (req, res) => {
  const users = await User.find({}).select("-password");
  console.log("here is res URL    " + req.originalUrl)
  const redisData = await redisClient.get("Mothi");
  console.log("Here is the redis data:  " + redisData)
  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  })
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
router.get("/search", userAuth, (req, res) => {
  const name = req.query.name;
  const role = req.query.role;
  res.send(`User name ${name} with role ${role} is being searched`)
})



module.exports = router
