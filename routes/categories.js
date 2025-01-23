// routes/categories.js
const router = require('express').Router();
const Product = require('../models/Product');

router.get('/', async (req, res) => {
 try {
   const categories = await Product.aggregate([
     {
       $group: {
         _id: "$category",
         products: { $sum: 1 },
         description: { $first: "$description" },
         image: { $first: "$images" }
       }
     },
     {
       $project: {
         name: "$_id",
         icon: { $arrayElemAt: ["$image", 0] },
         description: 1,
         products: 1,
         _id: 0
       }
     }
   ]);

   res.json(categories);
 } catch (error) {
   console.error('Category fetch error:', error);
   res.status(500).json({ message: 'Error fetching categories' });
 }
});

module.exports = router;