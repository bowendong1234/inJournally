const express = require('express');
const path = require('path');
const upload = require('../middleware/upload');
const { bucket } = require('../config/firebaseConfig');

const router = express.Router();

router.post('/images/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: 0, message: 'No file uploaded.' });
    }

    const { date, userID } = req.body;
    if (!date || !userID) {
      return res.status(400).json({ success: 0, message: 'Missing date or userID.' });
    }

    const extension = path.extname(req.file.originalname);
    const baseName = path.basename(req.file.originalname, extension).replace(/[^a-zA-Z0-9-_]/g, '_');
    const filename = `${Date.now()}-${baseName}${extension}`;
    const remoteFilePath = `Users/${userID}/${date}/Images/${filename}`;

    const fileUpload = bucket.file(remoteFilePath);
    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    stream.on('error', (error) => {
      console.error('Upload error:', error);
      res.status(500).json({ success: 0, message: 'Upload failed.' });
    });

    stream.on('finish', async () => {
      await fileUpload.makePublic();
      const url = `https://storage.googleapis.com/${bucket.name}/${remoteFilePath}`;
      res.json({ success: 1, file: { url } });
    });

    stream.end(req.file.buffer);
  } catch (error) {
    console.error('Error handling file upload:', error);
    res.status(500).json({ success: 0, message: 'Internal server error.' });
  }
});

module.exports = router;
