const express = require("express");
const multer = require("multer");
const router = express.Router();
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });


/**  
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
//malicious users can download sensitive files from your server.
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
/**
app.use('/uploads', express.static('uploads'));
app.use('/public/files', express.static('public/files'));
app.use('/images', express.static('public/images'));
 */

router.post("/", upload.single('avatar'), (req, res) => {
    console.log(req.file);
    console.log("****************")
    console.log(req.body);
    res.json({ fileUrl: `uploads/${req.file.originalname}` })
})

router.get('/:filename', (req, res) => {
    const filename = req.params.filename;
    const targetPath = path.join(__dirname, "../../uploads", filename);

    console.log("Looking for file at:", targetPath);
    console.log("_____________________");
    res.sendFile(targetPath, (err) => {
        if (err) {
            console.error("Internal res.sendFile error:", err);

            // Send a clean error message to the client if the file doesn't exist
            if (!res.headersSent) {
                res.status(404).json({ error: "File not found" });
            }
        }
    });
});

module.exports = router;