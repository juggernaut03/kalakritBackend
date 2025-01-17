// backend/routes/auth.js
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Debug log
    console.log('Login attempt for email:', email);

    // Find user by email
    const user = await User.findOne({ email });
    
    // If no user found
    if (!user) {
      console.log('No user found with email:', email);
      return res.status(404).json({ 
        success: false, 
        message: 'User not found. Please check your email or register.' 
      });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid password' 
      });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Success response
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
});

// Add a registration route if you haven't already
// routes/auth.js
router.post('/register', async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
  
      // Log the registration attempt
      console.log('Registration attempt:', { name, email, role });
  
      // Validate required fields
      if (!name || !email || !password || !role) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
      }
  
      // Validate role
      if (!['artisan', 'buyer'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Role must be either artisan or buyer'
        });
      }
  
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }
  
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Create new user
      const user = new User({
        name,
        email,
        password: hashedPassword,
        role
      });
  
      // Save user with detailed error logging
      try {
        await user.save();
      } catch (saveError) {
        console.error('User save error:', saveError);
        if (saveError.name === 'ValidationError') {
          return res.status(400).json({
            success: false,
            message: Object.values(saveError.errors).map(err => err.message).join(', ')
          });
        }
        throw saveError;
      }
  
      // Generate token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
  
      // Log successful registration
      console.log('User registered successfully:', user._id);
  
      res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
  
    } catch (error) {
      console.error('Registration error details:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during registration',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

module.exports = router;