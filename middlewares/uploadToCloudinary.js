const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Storage engine using Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => ({
    folder: 'medicare', // You can change this folder name
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    public_id: `${Date.now()}-${file.originalname}`,
  }),
});

// Multer middleware
const parser = multer({ storage });

// This function allows dynamic field config
const uploadImages = (fields) => parser.fields(fields);

// Example usage:
// uploadImages([{ name: 'productImage', maxCount: 1 }, { name: 'boxImage', maxCount: 1 }])

module.exports = uploadImages;
