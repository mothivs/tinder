const express = require("express");
const { User } = require("../models/user.js")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const router = express.Router()

//# CRUD Operations 
//#---------------------------------/
router.get("/user/:firstName", async (req, res) => {
  try {
    const firstName = req.params.firstName;
    const user = await User.findOne({ firstName }).select("-password");

    //^First check No user
    if (!user) {
      return res.status(404).json({
        success: false,
        error: `User with first name '${firstName}' not found`
      });
    }

    const userCookies = req.cookies;
    const { token } = userCookies;

    //^Second check No token
    if(!token){
      return res.status(401).json({ success: false, error: "No token provided" });
    }
    console.log("token: " + token);
    const payload = jwt.verify(token, process.env.SECRET_KEY)

    console.log("asdfadsfasdfasdfadsfasdf " + JSON.stringify(payload))

    if (user._id.toString() !== payload.id) {
      return res.status(401).json({
        success: false,
        error: `Unauthorised access`
      });
    }
    else {
      return res.status(200).json({
        success: true,
        data: user
      })
    }
  }
  catch (err) {
    return res.status(500).json({
      success: false,
      error: "Server error occurred",
      details: err.message
    });
  }
})

//^ Handles exactly: /user and for fetching all users
router.get("/user", async (req, res) => {
  const users = await User.find({}).select("-password");
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
 * req.query handles optional modifiers after a ? (e.g., /users?id=123).
 */

//^ first time - 200 OK
//^ Second time - 304 Nothing Modified response
router.get("/search", (req, res) => {
  const name = req.query.name;
  const role = req.query.role;
  res.send(`User name ${name} with role ${role} is being searched`)
})

router.post("/user", async (req, res) => {
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

router.put("/user/:firstName", async (req, res) => {
  try {
    console.log(req.body);
    const currentFirstName = req.params.firstName;

    const { firstName, lastName, gender } = req.body;

    const updatedUser = await User.findOneAndUpdate({ firstName: currentFirstName }, { firstName, lastName, gender }, { new: true, runValidators: true }).select("-password");
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

router.delete("/user/:firstName", async (req, res) => {


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
    const currentFirstName = req.params.firstName;
    const userDeleted = await User.findOneAndDelete({ firstName: currentFirstName });

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