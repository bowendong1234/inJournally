const express = require('express');
const upload = require('../middleware/upload');  // Import Multer middleware
const { uploadToFirebase, getImagesFromFirebase } = require('../services/firebaseService');

const router = express.Router();

const dotenv = require('dotenv');
const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";
dotenv.config({ path: envFile });
const API_BASE_URL = process.env.API_URL

// for saving pictures locally
router.post('/upload', upload.single('image'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).send('No file uploaded.');
      }
  
      // Construct the URL
      const url = `${API_BASE_URL}/uploads/${req.file.filename}`;
      console.log(url)
  
      res.send({
        success: 1,
        file: {
          url,
        },
      });
    } catch (err) {
      console.error('Error handling file upload:', err);
      res.status(500).send('Internal Server Error.');
    }
  });

// Route for saving uploaded images to Firebase
router.post('/uploadToFirebase', upload.single('image'), async (req, res) => {
    console.log("HERRRREEEE")
    const { userId, date, imageUrls } = req.body;
    if (!userId || !date || !imageUrls) {
        console.log(userId)
        console.log(date)
        console.log(imageUrls)
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
    console.log(userId)
    console.log(date)
    console.log(imageUrls)
    console.log(req.body)
    if (!userId || !date || !imageUrls) {
        console.log("PLS")
        return res.status(400).send('Invalid request body.');
    }

    try {
        // console.log("HELLOOO???")
        const imageUrlsArray = JSON.parse(imageUrls);
        const results = await getImagesFromFirebase(imageUrlsArray, userId, date);
        res.send(results);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;
