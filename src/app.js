const express = require("express");
const { connectToDB } = require("./config/database")
const { redisClient } = require("./config/redis")
const cookieParser = require("cookie-parser");
const userRouter = require("./routes/userRoutes.js")
const authRouter = require("./routes/authRoutes.js")
const requestRouter = require("./routes/requestRoutes.js")
const profileRouter = require("./routes/profileRoutes.js")
const uploadRouter = require("./routes/uploadRoutes.js")
require("dotenv").config();

const PORT = 3000;

const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/", authRouter);
app.use("/users", userRouter);
app.use("/request", requestRouter);
app.use("/profile", profileRouter);
app.use("/uploads", uploadRouter);


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
