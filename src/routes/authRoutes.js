const express = require("express");
const { User } = require("../models/user.js")
const { redisClient } = require("../config/redis.js")
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

      //^ Chain the response instead
      //*res.cookie("token", token);
      //*return res.status(200).json({ success: true, message: "Login successful" })

      await redisClient.set("Mothi", "This is my first redis variable");
      return res.cookie("token", token, { httpOnly: true }).status(200).json({ success: true, message: "Login successful" })
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

router.post("/signup", async (req, res) => {
  console.log(req.body);

  const { firstName, lastName, email, phoneNumber, userName, password, dob } = req.body;

  try {
    if (!firstName) {
      throw new Error("First Name cannot be empty");
    }
    if (!lastName) {
      throw new Error("Last Name cannot be empty");
    }
    if (!email) {
      throw new Error("Email cannot be empty");
    }
    if (!phoneNumber) {
      throw new Error("Phone number cannot be empty");
    }
    if (!userName) {
      throw new Error("User Name cannot be empty");
    }
    if (!password) {
      throw new Error("Password cannot be empty");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      email,
      phoneNumber,
      userName,
      password: passwordHash,
      dob,
    });

    await user.save();

    return res.status(201).json({
      message: "User created!",
      userData: {
        firstName,
        lastName,
        userName,
        email,
        phoneNumber,
        dob,
      }
    });
  } catch (err) {
    console.error(err.stack);
    return res.status(400).json({ error: err.message });
  }
})

router.post("/reset-password", async (req, res)=> {
  //# Write the logic for reset password here.
})

module.exports = router
