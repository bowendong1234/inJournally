const express = require('express');
const cors = require('cors');
const path = require('path');
const firebaseRoutes = require('./routes/firebase'); 
const spotifyRoutes = require('./routes/spotify');
const { pollSpotifyStreams } = require('./services/spotifyService');

const app = express();
const port = 3000;

require('dotenv').config();

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));  // For parsing form data

// Use Firebase routes
app.use('/api', firebaseRoutes);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// for spotify routes
app.use('/spotify', spotifyRoutes);

const POLL_INTERVAL = 15 * 60 * 1000; 
setInterval(async () => {
  try {
      await pollSpotifyStreams();
  } catch (error) {
      console.error('Error while polling Spotify streams:', error);
  }
}, POLL_INTERVAL);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
// const express = require('express');
// const multer = require('multer');
// const path = require('path');
// const cors = require('cors');
// const admin = require('firebase-admin');
// const fs = require('fs');
// const mime = require('mime-types');

// const app = express();
// const port = 3000;
// require('dotenv').config();

// // Firebase Admin initialization
// const serviceAccount = require('../serviceAccountKey.json'); 

// // initialising storage bucket
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   storageBucket: 'journal-88326.appspot.com'
// });
// const bucket = admin.storage().bucket();

// // Start the server
// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });

// // Enable CORS
// app.use(cors());
// app.use(express.json());

// // Multer configuration for file upload
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/'); // Ensure this directory exists
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
//   }
// });

// const upload = multer({ storage: storage });

// // Route for saving uploaded images to firebase
// app.post('/api/uploadToFirebase', upload.single('image'), async (req, res) => {
//   console.log(req.body);
//   const { userId, date, imageUrls } = req.body;
  
//   if (!userId || !date || !imageUrls) {
//     return res.status(400).send('Invalid request body.');
//   }
//   const imageUrlsArray = JSON.parse(imageUrls);
//   console.log("got here")

//   const fileUploadPromises = imageUrlsArray.map(async (imageUrl) => {
//     const parts = imageUrl.split('/');
//     const filename = parts[parts.length - 1];
    
//     const localFilePath = path.join(__dirname, 'uploads', filename);
//     const remoteFilePath = `Users/${userId}/${date}/Images/${filename}`;

//     try {
//       const contentType = mime.lookup(localFilePath) || 'application/octet-stream';
//       await bucket.upload(localFilePath, {
//         destination: remoteFilePath,
//         metadata: {
//           contentType: contentType
//         },
//       });

//       const fileUrl = `https://storage.googleapis.com/${bucket.name}/${remoteFilePath}`;
      
//       // Save metadata to Firestore
//       // await db.collection('users').doc(userId).collection('uploads').add({
//       //   url: fileUrl,
//       //   date: date,
//       //   filename: filename,
//       // });

//       return {
//         success: 1,
//         file: {
//           url: fileUrl,
//         },
//       };
//     } catch (error) {
//       console.error('Error uploading file:', error);
//       throw new Error('Internal Server Error.');
//     }
//   });

//   try {
//     const results = await Promise.all(fileUploadPromises);
//     res.send(results);
//   } catch (error) {
//     res.status(500).send(error.message);
//   }
// });

// // route for retrieving images from firebase
// app.post('/api/getImagesFromFirebase', upload.single('image'), async (req, res) => {
//   const { userId, date, imageUrls } = req.body;
  
//   if (!userId || !date || !imageUrls) {
//     return res.status(400).send('Invalid request body.');
//   }
//   const imageUrlsArray = JSON.parse(imageUrls);
//   console.log("got here")

//   const fileURetrievalPromises = imageUrlsArray.map(async (imageUrl) => {
//     const parts = imageUrl.split('/');
//     const filename = parts[parts.length - 1];
//     const localFilePath = path.join(__dirname, 'uploads', filename);
//     if (!fs.existsSync(localFilePath)) {
//       console.log('getting image');
//       const remoteFilePath = `Users/${userId}/${date}/Images/${filename}`;
//       console.log(remoteFilePath)
//       const image = bucket.file(remoteFilePath)
//       const [exists] = await image.exists();
//       if (exists) {
//         console.log("this happeneded")
//         const [contents] = await image.download({destination: localFilePath});
//       }
//     } else {
//         console.log('File already exists');
//     }
//   });
//   try {
//     const results = await Promise.all(fileURetrievalPromises);
//     console.log(results)
//     res.send(results);
//   } catch (error) {
//     res.status(500).send(error.message);
//   }
//   return {
//     success: 1,
//   };

// });

// app.post('/api/upload', upload.single('image'), (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).send('No file uploaded.');
//     }

//     // Construct the URL
//     const url = `http://localhost:3000/uploads/${req.file.filename}`;
//     console.log(url)

//     res.send({
//       success: 1,
//       file: {
//         url,
//       },
//     });
//   } catch (err) {
//     console.error('Error handling file upload:', err);
//     res.status(500).send('Internal Server Error.');
//   }
// });

// // Serve uploaded files statically
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// // SPOTIFY STUFF
// const spotifyApi = new SpotifyWebApi({
//   clientId: process.env.SPOTIFY_CLIENT_ID,
//   clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
//   redirectUri: 'http://localhost:5173/editor/redirect',
// });

// app.get('/login', (req, res) => {
//   const scopes = ['user-read-recently-played', 'user-read-playback-state'];
//   res.redirect(spotifyApi.createAuthorizeURL(scopes));
// });

// app.get('/callback', async (req, res) => {
//   const { code } = req.query;
//   const data = await spotifyApi.authorizationCodeGrant(code);
//   const { access_token, refresh_token, expires_in } = data.body;

//   // Store refresh token in Firebase under the user document
//   const userRef = firebase.firestore().collection('Users').doc(userId);
//   await userRef.set({ refreshToken: refresh_token }, { merge: true });

//   res.redirect('/'); // Redirect user to app after login
// });

// // Refresh token when access token expires
// app.get('/refresh_token', async (req, res) => {
//   const userId = req.userId; // Use user ID to get stored refresh token
//   const userRef = firebase.firestore().collection('Users').doc(userId);
//   const userData = await userRef.get();
//   spotifyApi.setRefreshToken(userData.data().refreshToken);
  
//   const data = await spotifyApi.refreshAccessToken();
//   const { access_token } = data.body;
  
//   res.send({ accessToken: access_token });
// });

// // for polling user streams
// const pollStreams = async (userId) => {
//   try {
//     const userRef = firebase.firestore().collection('Users').doc(userId);
//     const userData = await userRef.get();
//     spotifyApi.setAccessToken(userData.data().accessToken);

//     // Fetch recently played tracks
//     const data = await spotifyApi.getMyRecentlyPlayedTracks({ limit: 10 });
//     const recentTracks = data.body.items;
//     const date = new Date().toISOString().split('T')[0]; // Today's date
    
//     const streamingDataRef = firebase.firestore().collection('Users')
//       .doc(userId).collection('UserStreaming').doc(date);
    
//     await streamingDataRef.set({
//       streams: firebase.firestore.FieldValue.arrayUnion(...recentTracks),
//     }, { merge: true });
//   } catch (err) {
//     console.error('Error polling Spotify streams:', err);
//   }
// };

// // Poll every 10 minutes
// setInterval(() => {
//   // Iterate over each user and poll for their streams
//   users.forEach(user => pollStreams(user.id));
// }, 600000);