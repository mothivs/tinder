const express = require("express");
const { User } = require("../models/user.js")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs")

const router = express.Router()

//# Login
//#--------------------------------------/
//^ Check Login Creds
router.post("/login", async (req, res) => {
  try {
    const { userName, password } = req.body

    console.log(`Login attempt for username: ${userName}`);
    const user = await User.findOne({ userName });

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" })
    }
    const isPassowrdMatch = await bcrypt.compare(password, user.password)
    if (isPassowrdMatch) {
      const userProfilePayload = {
        id: user._id,
        role: "admin"
      }
      const token = jwt.sign(userProfilePayload, process.env.SECRET_KEY, { expiresIn: "7d" })
      console.log('Generated JWT:', token);

      res.cookie("token", token);
      return res.status(200).json({ success: true, message: "Login successful" })
    }
    else {
      return res.status(401).json({ success: false, message: "Invalid credentials" })
    }

  }
  catch (err) {
    console.log("Error occured", err);
    return res.status(500).send("Server error")
  }
})

router.post("/logout", async (req, res)=> {
    res.cookie("token", "", {
      expires: new Date(0),
      httpOnly: true
    });
      return res.status(200).json({ success: true, message: "Logout successful" })
})

module.exports = router