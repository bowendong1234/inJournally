const express = require('express');
const upload = require('../middleware/upload'); 
const { uploadToFirebase, getImagesFromFirebase} = require('../services/firebaseService');
const router = express.Router();
const { bucket } = require('../config/firebaseConfig');
const dotenv = require('dotenv');
const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";
dotenv.config({ path: envFile });
const API_BASE_URL = process.env.API_URL

// // for uploading pictures (new way)
router.post('/uploadFile', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }
    const {date, userID} = req.body
    // const url = `${API_BASE_URL}/uploads/${req.file.filename}`;
    const remoteFilePath = `Users/${userID}/${date}/Images/${req.file.originalname}`;
    const fileUpload = bucket.file(remoteFilePath)
    console.log(req.file.originalname)

    // Create a stream to upload file to Firebase Storage
    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    stream.on('error', (err) => {
      console.error("Upload error:", err);
      return res.status(500).json({ success: 0, message: "Upload failed" });
    });

    stream.on('finish', async () => {
      await fileUpload.makePublic();
      const url = `https://storage.googleapis.com/${bucket.name}/${remoteFilePath}`;

      res.send({
        success: 1,
        file: {
          url,
        },
      });
    });
    stream.end(req.file.buffer);
    // res.send({
    //   success: 1,
    //   file: {
    //     url,
    //   },
    // });
  } catch (err) {
    console.error('Error handling file upload:', err);
  }
}
)




// for uploading pictures (old way)
router.post('/upload', upload.single('image'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).send('No file uploaded.');
      }
  
      // Construct the URL
      const url = `${API_BASE_URL}/uploads/${req.file.filename}`;
  
      res.send({
        success: 1,
        file: {
          url,
        },
      });
    } catch (err) {
      console.error('Error handling file upload:', err);
    }
  });

// Route for saving uploaded images to Firebase
router.post('/uploadToFirebase', upload.single('image'), async (req, res) => {
    const { userId, date, imageUrls } = req.body;
    if (!userId || !date || !imageUrls) {
        return res.status(400).send('Invalid request body.');
    }

    try {
        const imageUrlsArray = JSON.parse(imageUrls);
        const results = await uploadToFirebase(imageUrlsArray, userId, date);
        res.send(results);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Route for retrieving images from Firebase
router.post('/getImagesFromFirebase', upload.none(), async (req, res) => {
    const { userId, date, imageUrls } = req.body;
    if (!userId || !date || !imageUrls) {
        return res.status(400).send('Invalid request body.');
    }

    try {
        const imageUrlsArray = JSON.parse(imageUrls);
        const results = await getImagesFromFirebase(imageUrlsArray, userId, date);
        res.send(results);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;
