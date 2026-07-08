const express = require("express");
const { connectToDB } = require("./config/database")
const { redisClient } = require("./config/redis")
const cookieParser = require("cookie-parser");
const userRouter = require("./routes/userRoutes.js")
const authRouter = require("./routes/authRoutes.js")
const requestRouter = require("./routes/requestRoutes.js")
const profileRouter = require("./routes/profileRoutes.js")
const uploadRouter = require("./routes/uploadRoutes.js")
const connectionRouter = require("./routes/connectionRoutes.js")
const notificationRouter = require("./routes/notificationRoutes.js")
const { profileLimiter, authLimiter, uploadLimiter } = require("./middlewares/rateLimiter.js"); 
const userAuth = require("./middlewares/userAuth.js")
require("dotenv").config();

const PORT = 3000;

const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


//^If your application sits behind a reverse proxy (like Nginx, Cloudflare, Heroku, or AWS ALB), 
//^ express-rate-limit will see the IP address of the proxy rather than the real client. 
//^ This means one user could hit the limit and accidentally block all users.
app.set('trust proxy', 1);

// 1. Strict limits for authentication routes
app.use("/", authLimiter, authRouter); 

// 2. Strict limits for heavy file uploads
app.use("/uploads", uploadLimiter, uploadRouter); 

// 3. Standard limits for LoggedIn endpoints first use userAuth middleware.
app.use("/users", userAuth, profileLimiter, userRouter);
app.use("/request", userAuth, profileLimiter, requestRouter);
app.use("/connections", userAuth, profileLimiter, connectionRouter);
app.use("/profile", userAuth, profileLimiter, profileRouter);
app.use("/notifications", userAuth, profileLimiter, notificationRouter);


//# Connect to DB/Redis and START the Server

Promise.all([connectToDB(), redisClient.connect()]).then(() => {
  app.listen(PORT, () => {
    console.log(`✅ server is listening on PORT ${PORT}`)
  })
  console.log("✅ Connection to DB established successfully")
  console.log('✅ Connected to Redis on port 6379');
}).catch((err) => {
  console.error("Connection failed:", err);
  process.exitCode = 1;
})


//# Error handling

app.use((err, req, res, _next) => {
  console.error(err.stack);

  if (err.name === "ValidationError") {
    const validationErrors = Object.fromEntries(
      Object.entries(err.errors).map(([field, error]) => [field, error.message])
    );

    console.error("Validation errors:", validationErrors);
    return res.status(400).json({
      message: "User validation failed",
      errors: validationErrors
    });
  }

  res.status(500).json({ message: "Something went wrong " });
})
