const express = require("express");
const { User } = require("../models/user.js")
const { redisClient } = require("../config/redis.js")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sendEmailOTP = require("../../utils/notification.js");

const router = express.Router();

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
      const aceessToken = jwt.sign(userProfilePayload, process.env.ACCESS_TOKEN_SECRET_KEY, { expiresIn: "1d" })
      const refreshToken = jwt.sign(userProfilePayload, process.env.REFRESH_TOKEN_SECRET_KEY, { expiresIn: "7d" })

      //^ Chain the response instead
      //*res.cookie("access_token", aceessToken);
      //*return res.status(200).json({ success: true, message: "Login successful" })

      await redisClient.set("Mothi", "This is my first redis variable");
      return res.cookie("access_token", aceessToken,
        {
          httpOnly: true,                                // Prevent client-side JS from reading the cookie (XSS protection)
          secure: process.env.NODE_ENV === 'production', // Send cookie over HTTPS only 
          sameSite: process.env.SAME_SITE_LAX,           // To avoid CSRF attacks ('lax' for local and 'strict' for prod)
          maxAge: 1 * 24 * 60 * 60 * 1000                         // In milliseconds(1 sec = 1000ms)
        },
      )
        .cookie("refresh_token", refreshToken,
          {
            httpOnly: true,                                // Prevent client-side JS from reading the cookie (XSS protection)
            secure: process.env.NODE_ENV === 'production', // Send cookie over HTTPS only 
            sameSite: process.env.SAME_SITE_LAX,           // To avoid CSRF attacks ('lax' for local and 'strict' for prod)
            path: "/refresh",                               // Applicable only for this path
            maxAge: 7 * 24 * 60 * 60 * 1000                // In milliseconds(1 sec = 1000ms)
          },)
        .status(200).json({ success: true, message: "Login successful" })
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

router.post("/logout", async (req, res) => {
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

router.post("/generate-otp", async (req, res) => {
  //# Write the logic for generating OTP here.
  try {
    const { emailId } = req.body || {};

    if (!emailId) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const otpAttempts = Number(await redisClient.get(`otpAttemptCount:${emailId}`)) || 0;

    if (otpAttempts >= 5) {
      return res.status(429).json({ success: false, message: "Max limit of 5 OTPs reached! Locked for 5 mins." });
    }

    //^ This is not the safe way of generating OTP
    //^Math.random() is not cryptographically secure
    //^It uses a predictable algorithm that malicious hackers can mathematically guess 
    //^ if they monitor your server's outputs over time
    //# Use Node.js's native crypto module
    //  const OTP = Math.floor(100000 + Math.random() * 900000);
    //  console.log(OTP);
    //^write logic of sending OTP to this emailID
    const otp = await sendEmailOTP(emailId);
    if (!otp) {
      return res.status(500).json({ success: false, message: "Failed to dispatch email." });
    }

    // 3. Store OTP in Redis with a 5-minute (300 seconds) expiration window
    // Key structured uniquely as "otp:emailId"
    await redisClient.set(`otp:${emailId}`, otp, {
      EX: 300
    });

    await redisClient.set(`otpAttemptCount:${emailId}`, 0);
    return res.status(200).json({ success: true, message: "OTP sent successfully!" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Something went wrong!" })
  }
})

router.post("/verify-otp", async (req, res) => {
  try {
    const { emailId, otp } = req.body || {};

    if (!emailId || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const otpAttempts = Number(await redisClient.get(`otpAttemptCount:${emailId}`));

    if (otpAttempts >= 5) {
      return res.status(429).json({ success: false, message: "Max limit of 5 incorrect OTPs reached! Locked for 5 mins." });
    }

    const sentOTP = await redisClient.get(`otp:${emailId}`);

    //^ Check if OTP has completely timed out in Redis
    if (!sentOTP) {
      return res.status(400).json({ success: false, message: "OTP has expired or was never requested." });
    }

    if (Number(otp) !== Number(sentOTP)) {
      await redisClient.incr(`otpAttemptCount:${emailId}`);
      //^ Calculate remaining attempts dynamically for user feedback
      const remaining = 5 - (otpAttempts + 1);
      return res.status(400).json({
        success: false,
        message: `Invalid OTP! You have ${remaining} attempts remaining.`
      });
    }

    await redisClient.del(`otp:${emailId}`);
    await redisClient.del(`otpAttemptCount:${emailId}`);

    const jwtOTPPayload = { emailId }

    const jwtToken = jwt.sign(jwtOTPPayload, process.env.SECRET_KEY, { expiresIn: 300 })

    return res.status(200).json({ success: true, message: "OTP verified successfully!", token: jwtToken });

  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Something went wrong!" })
  }
})

router.post("/reset-password", async (req, res) => {
  //# Write the logic for reset password here.
  try {
    const { emailId, oldPassword, newPassword, token } = req.body || {};

    if (!emailId || !oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Need email, old password, and new password" })
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Missing Token!" })
    }

    const decodedToken = jwt.verify(token, process.env.OTP_TOKEN_SECRET_KEY);

    if (decodedToken.emailId !== emailId) {
      return res.status(401).json({ success: false, message: "Invalid Token!" })
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({ success: false, message: "New Password cannot be same as old Password" });
    }

    const user = await User.findOne({ email: emailId });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found!" })
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isOldPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid Password!" })
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    await redisClient.del(`otp:${emailId}`);
    await redisClient.del(`otp:${emailId}:token`);

    return res.status(200).json({ success: true, message: "Password changed successfully" })
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Something went wrong!" })
  }
})

router.post("/refresh", async (req, res) => {
  //# Write the logic for reset password here.
  try {
    const { refresh_token } = req.cookies;

    if (!refresh_token) {
      return res.status(401).json({ success: false, message: "Missing Token!" })
    }

    const decodedRefreshToken = jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET_KEY);

    const userProfilePayload = {
      id: decodedRefreshToken.id,
      role: "admin"
    }

    const newAccessToken = jwt.sign(userProfilePayload, process.env.ACCESS_TOKEN_SECRET_KEY, { expiresIn: "15m" })

    return res.cookie("access_token", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 15 * 60 * 1000
    })
      .status(200).json({ success: true, message: "New Access Token sent" });

  } catch (err) {
    console.error("Auth Error:", err.message);
    //# 4. Handle JWT-specific verification failures
    if (err.name === 'JsonWebTokenError'|| err.name === 'TokenExpiredError') {
      res.clearCookie("accessToken", { path: "/" });
        res.clearCookie("refreshToken", { path: "/refresh" });
      return res.status(401).json({ success: false, message: "Unauthorized: Invalid or expired token" });
    }
    
    //# 5. Catch actual server-side errors
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
})



module.exports = router
