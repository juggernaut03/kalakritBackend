// routes/products.js
const router = require('express').Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const { uploadToCloudinary } = require('../config/cloudinary');

router.post('/', auth, async (req, res) => {
  try {
    console.log('Starting product creation with images');
    const { name, description, price, category, stock, images } = req.body;

    // Upload images to Cloudinary
    const imageUrls = [];
    if (images && images.length > 0) {
      console.log(`Processing ${images.length} images for upload`);
      
      for (const base64Image of images) {
        try {
          console.log('Uploading image to Cloudinary...');
          const imageUrl = await uploadToCloudinary(base64Image);
          if (imageUrl) {
            imageUrls.push(imageUrl);
            console.log('Successfully uploaded image:', imageUrl);
          }
        } catch (uploadError) {
          console.error('Individual image upload error:', uploadError);
        }
      }
      console.log(`Successfully uploaded ${imageUrls.length} images`);
    }

    const product = new Product({
      name,
      description,
      price: Number(price),
      category,
      stock: Number(stock),
      images: imageUrls,
      artisan: req.user.userId
    });

    await product.save();
    console.log('Product saved with images:', {
      id: product._id,
      imageCount: imageUrls.length
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({ 
      message: 'Error creating product', 
      error: error.message 
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};
    
    const products = await Product.find(query)
      .sort({ createdAt: -1 });
      
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;