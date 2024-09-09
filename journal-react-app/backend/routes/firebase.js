const express = require('express');
const upload = require('../middleware/upload');  // Import Multer middleware
const { uploadToFirebase, getImagesFromFirebase } = require('../services/firebaseService');

const router = express.Router();

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
