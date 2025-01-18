// config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Verify Cloudinary credentials are present
const requiredEnvVars = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = async (base64Image) => {
  try {
    if (!base64Image) {
      throw new Error('No image data provided');
    }

    // Add data URI prefix if not present
    const imageData = base64Image.includes('data:image') 
      ? base64Image 
      : `data:image/jpeg;base64,${base64Image}`;

    console.log('Uploading to Cloudinary with length:', imageData.length);

    const uploadResponse = await cloudinary.uploader.upload(imageData, {
      folder: 'kalakriti_products',
      resource_type: 'auto',
      allowed_formats: ['jpg', 'jpeg', 'png']
    });

    console.log('Cloudinary upload successful:', uploadResponse.secure_url);
    return uploadResponse.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error details:', {
      message: error.message,
      name: error.name
    });
    throw error;
  }
};

// Test Cloudinary connection on startup
cloudinary.api.ping()
  .then(() => console.log('Cloudinary connection successful'))
  .catch(error => console.error('Cloudinary connection error:', error));

module.exports = { cloudinary, uploadToCloudinary };