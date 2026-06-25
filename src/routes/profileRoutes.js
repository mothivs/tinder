const express = require("express");
const { User } = require("../models/user.js")
const bcrypt = require("bcryptjs");
const userAuth = require("../middlewares/userAuth.js");

const router = express.Router();

router.get("/", userAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findOne({ _id: userId }).select("-password");

    //^First check No user
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

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

    const updatedUser = await User.findOneAndUpdate({ _id: userId }, { firstName, lastName, gender }, { new: true, runValidators: true }).select("-password");
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

    const user = await User.findOne({ _id: userId });

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
    user.password = hashedNewPassword;
    await user.save();
    return res.status(200).json({ success: true, message: "Password changed succesfully" })

  } catch (err) {
    console.log(err);
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
    const userDeleted = await User.findOneAndDelete({ _id: userId });

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