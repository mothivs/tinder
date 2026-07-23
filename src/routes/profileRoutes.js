const express = require("express");
//const { User } = require("../models/user.js")
const bcrypt = require("bcryptjs");
const userAuth = require("../middlewares/userAuth.js");
const { redisClient } = require("../config/redis.js")
const db = require("../../db/knex.js")
const { SAFE_USER_COLUMNS } = require("../utils/constants.js");
const router = express.Router();




router.get("/", userAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userProfileCacheKey = `profile:${userId}`;

    const cachedUser = await redisClient.get(userProfileCacheKey);

    if (cachedUser) {
      const user = JSON.parse(cachedUser)
      console.log(`✅ Returning from Cache: ${userProfileCacheKey}`, user)
      return res.status(200).json({
        success: false,
        data: user
      })
    }

    console.log(`❌ Cache miss:  ${userProfileCacheKey}`)

    const user = await db("users").select(SAFE_USER_COLUMNS).where({ id: userId }).first();

    //^First check No user
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    await redisClient.set(userProfileCacheKey, JSON.stringify(user), "EX", 3600);
    console.log(`💾 Data cached successfully for ${userProfileCacheKey}`);


    return res.status(200).json({
      success: true,
      data: user
    })
  }
  catch (err) {
    console.log(err.message);
    return res.status(500).json({
      success: false,
      error: "Server error occurred"
    });
  }
})

router.patch("/", userAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const { firstName, lastName, gender } = req.body;

    const updatedUser = await db("users").where({ id: userId })
      .update({ firstName, lastName, gender }).returning(SAFE_USER_COLUMNS);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: `User named '${currentFirstName}' not found`
      });
    }
    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser
    })
  }
  catch (err) {
    console.log("erreor", err.message)
    return res.status(500).send("Server error occured");
  }
})

router.post("/change-password", userAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const { userName, currentPassword, newPassword } = req.body;

    if (!userName || !currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields (username, current password, and new password) are required."
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old password cannot be same as New passowrd"
      });
    }

    const user = await db("users").select('*').where({ id: userId }).first();

    if (user.userName !== userName) {
      return res.status(401).json({ success: false, message: "invalid username" })
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password)

    if (!validPassword) {
      return res.status(401).json({ success: false, message: "Incorrect current password" });
    }

    //^ Dont use findOneAndUpdate for password change - Plain password gets stored
    //^ It bypasses all pre save hooks and all validations if we use this.
    //^ One additional DB call since we already bought user.findOne to memory
    //*await User.findOneAndUpdate({_id: userId}, {password: newPassword})
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)
    //user.password = hashedNewPassword;
    await db("users").where({ id: userId }).update({ password: hashedNewPassword });
    return res.status(200).json({ success: true, message: "Password changed succesfully" })

  } catch (err) {
    console.log(err.message);
    res.status(500).json({ success: false, message: "Something went wrong" })
  }
})

router.delete("/", userAuth, async (req, res) => {


  //^Dont mix these two await and promises
  /**
 const userDelPromise = await User.findOneAndDelete({firstName});
 userDelPromise.then(()=>{
   res.status(200).json({success: true, message: "User deleted successfully"})
 }).catch(err=> res.status(500).json({success: false, message: "User delettion failed"})) 
 }
  catch(err){
   return res.status(500).send("Something went wrong")
  }
    */

  try {
    const userId = req.user.id;
    const userDeleted = await db("users").where({ id: userId }).del();

    if (!userDeleted) {
      return res.status(404).json({ success: false, message: "User not found" })
    }
    return res.status(200).json({ success: true, message: "User deleted successfully" })
  }
  catch (err) {
    console.error(err);
    return res.status(500).send("Something went wrong")
  }
})

module.exports = router