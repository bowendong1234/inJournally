const path = require('path');
const mime = require('mime-types');
const fs = require('fs');
const { bucket } = require('../config/firebaseConfig');

// Function to upload images to Firebase
const uploadToFirebase = async (imageUrlsArray, userId, date) => {
    console.log("uploading")
    const fileUploadPromises = imageUrlsArray.map(async (imageUrl) => {
        const parts = imageUrl.split('/');
        const filename = parts[parts.length - 1];
        const localFilePath = path.join(__dirname, '../uploads', filename);
        const remoteFilePath = `Users/${userId}/${date}/Images/${filename}`;

        try {
            const contentType = mime.lookup(localFilePath) || 'application/octet-stream';
            await bucket.upload(localFilePath, {
                destination: remoteFilePath,
                metadata: { contentType },
            });

            const fileUrl = `https://storage.googleapis.com/${bucket.name}/${remoteFilePath}`;
            return { success: 1, file: { url: fileUrl } };
        } catch (error) {
            console.error('Error uploading file:', error);
            throw new Error('Internal Server Error.');
        }
    });

    return Promise.all(fileUploadPromises);
};

// Function to retrieve images from Firebase
const getImagesFromFirebase = async (imageUrlsArray, userId, date) => {
    console.log("HEREEEE")
    console.log(imageUrlsArray)
    const fileURetrievalPromises = imageUrlsArray.map(async (imageUrl) => {
        const parts = imageUrl.split('/');
        const filename = parts[parts.length - 1];
        const localFilePath = path.join(__dirname, '../uploads', filename);

        if (!fs.existsSync(localFilePath)) {
            console.log("downloading")
            const remoteFilePath = `Users/${userId}/${date}/Images/${filename}`;
            const image = bucket.file(remoteFilePath);
            const [exists] = await image.exists();

            if (exists) {
                console.log("this should happen")
                await image.download({ destination: localFilePath });
            }
        }
    });

    return Promise.all(fileURetrievalPromises);
};

module.exports = { uploadToFirebase, getImagesFromFirebase };
