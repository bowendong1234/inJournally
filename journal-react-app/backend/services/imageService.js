const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const admin = require('firebase-admin');
const fs = require('fs');
const mime = require('mime-types');

const app = express();
const port = 3000;
require('dotenv').config();

// Firebase Admin initialization
const serviceAccount = require('../serviceAccountKey.json'); 

// initialising storage bucket
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'journal-88326.appspot.com'
});
const bucket = admin.storage().bucket();

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Enable CORS
app.use(cors());
app.use(express.json());

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Ensure this directory exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Route for saving uploaded images to firebase
app.post('/api/uploadToFirebase', upload.single('image'), async (req, res) => {
  console.log(req.body);
  const { userId, date, imageUrls } = req.body;
  
  if (!userId || !date || !imageUrls) {
    return res.status(400).send('Invalid request body.');
  }
  const imageUrlsArray = JSON.parse(imageUrls);
  console.log("got here")

  const fileUploadPromises = imageUrlsArray.map(async (imageUrl) => {
    const parts = imageUrl.split('/');
    const filename = parts[parts.length - 1];
    
    const localFilePath = path.join(__dirname, 'uploads', filename);
    const remoteFilePath = `Users/${userId}/${date}/Images/${filename}`;

    try {
      const contentType = mime.lookup(localFilePath) || 'application/octet-stream';
      await bucket.upload(localFilePath, {
        destination: remoteFilePath,
        metadata: {
          contentType: contentType
        },
      });

      const fileUrl = `https://storage.googleapis.com/${bucket.name}/${remoteFilePath}`;
      
      // Save metadata to Firestore
      // await db.collection('users').doc(userId).collection('uploads').add({
      //   url: fileUrl,
      //   date: date,
      //   filename: filename,
      // });

      return {
        success: 1,
        file: {
          url: fileUrl,
        },
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Internal Server Error.');
    }
  });

  try {
    const results = await Promise.all(fileUploadPromises);
    res.send(results);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// route for retrieving images from firebase
app.post('/api/getImagesFromFirebase', upload.single('image'), async (req, res) => {
  const { userId, date, imageUrls } = req.body;
  
  if (!userId || !date || !imageUrls) {
    return res.status(400).send('Invalid request body.');
  }
  const imageUrlsArray = JSON.parse(imageUrls);
  console.log("got here")

  const fileURetrievalPromises = imageUrlsArray.map(async (imageUrl) => {
    const parts = imageUrl.split('/');
    const filename = parts[parts.length - 1];
    const localFilePath = path.join(__dirname, 'uploads', filename);
    if (!fs.existsSync(localFilePath)) {
      console.log('getting image');
      const remoteFilePath = `Users/${userId}/${date}/Images/${filename}`;
      console.log(remoteFilePath)
      const image = bucket.file(remoteFilePath)
      const [exists] = await image.exists();
      if (exists) {
        console.log("this happeneded")
        const [contents] = await image.download({destination: localFilePath});
      }
    } else {
        console.log('File already exists');
    }
  });
  try {
    const results = await Promise.all(fileURetrievalPromises);
    console.log(results)
    res.send(results);
  } catch (error) {
    res.status(500).send(error.message);
  }
  return {
    success: 1,
  };

});

app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    // Construct the URL
    const url = `http://localhost:3000/uploads/${req.file.filename}`;
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

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));