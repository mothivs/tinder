const express = require("express");
const multer = require("multer");
const { adminAuth } = require("./middlewares/adminAuth")
const { connectToDB } = require("./config/database")
const cookieParser = require("cookie-parser");
const userRouter = require("./routes/userRoute.js")
const authRouter = require("./routes/authRoute.js")
const connectionsRouter = require("./routes/connectionsRoute.js")


const app = express()
app.use(express.json());
app.use(cookieParser());
app.use("/", userRouter);
app.use("/", authRouter);
app.use("/", connectionsRouter);
//app.use(express.static("public"));

const SECRET_KEY = 'your-super-long-and-secure-secret-key';


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

const PORT = 3000;

//# Connect to DB and START the Server

connectToDB().then(() => {
  app.listen(PORT, () => {
    console.log(`server is listening on PORT ${PORT}`)
  })
  console.log("Connection to DB established successfully")
}).catch((err) => {
  console.error("Connection to DB failed:", err);
  process.exitCode = 1;
})


/*
app.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  console.log("_____________________");
  console.log("dir name ", __dirname)
  res.sendFile(__dirname + `/uploads/${filename}`);
});

app.get('/images/:filename', (req, res) => {
  const filename = req.params.filename;
  console.log("_____________________");
  console.log("dir name ", __dirname)
  res.sendFile(__dirname + `/public/images/${filename}`);
});
*/

/**Exposes Path Traversal security issue */
/**
app.get('/files/:filename', (req, res) => {
  const filename = req.params.filename;
  console.log("_____________________");
  console.log("dir name ", __dirname)
  res.sendFile(__dirname + `/public/images/${filename}`);
});

2. use pathname
3. use express.static
*/

//# File management
//#---------------------------------/
app.use('/uploads', express.static('uploads'));
app.use('/public/files', express.static('public/files'));
app.use('/images', express.static('public/images'));

app.post("/upload", upload.single('avatar'), (req, res) => {
  console.log(req.file);
  console.log("****************")
  console.log(req.body);
  res.json({ fileUrl: `uploads/${req.file.originalname}` })
})

//# Middleware
//#--------------------------------------/
/**
app.use("/",(req,res)=>{
  //^Route Handlers(RH)
})
**1 route can have muliple RHs
** app.use(ROUTE , RH1, RH2, RH3) 
 */

app.use("/user-role", (req, res, next) => {
  console.log("RH1");
  res.send("response back")
  next()
  //res.send("response back")
},
  (req, res, next) => {
    console.log("RH2");
    res.send("response back 2")
    next();
  },
)

app.use("/admin", adminAuth);
app.get("/admin", (req, res) => {
  try {
    throw new Error("There is something paranormal here")
    res.send("Gave all admin creds")
  }
  catch (err) {
    res.status(400).send("Bad Request!" + err)
  }
})

app.post("/admin", (req, res) => {
  res.send("Posted all admin creds")
})

app.use((err, req, res, next) => {
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
