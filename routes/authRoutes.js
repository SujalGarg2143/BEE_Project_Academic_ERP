const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/User');
const sendEmail = require('../utils/sendEmail');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Send OTP via email
    await sendEmail(user.email, "Your OTP Code", `Your OTP is ${otp}`);

    // Store OTP and email temporarily in HttpOnly cookie, expires in 5 mins
    res.cookie('otpData', JSON.stringify({ email, otp }), {
      httpOnly: true,
      secure: false, // true if using HTTPS
      maxAge: 5 * 60 * 1000 // 5 minutes
    });

    res.json({ message: 'OTP sent to your email' });

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// otp-verify
router.post('/verify-otp', async (req, res) => {
  const { otp } = req.body;

  const otpData = req.cookies.otpData;
  if (!otpData) return res.status(400).json({ message: 'OTP expired. Please login again' });

  const { email, otp: storedOtp } = JSON.parse(otpData);

  if (otp !== storedOtp) return res.status(400).json({ message: 'Invalid OTP' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    // OTP verified → remove temporary cookie
    res.clearCookie('otpData');

    // Issue JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      maxAge: 60 * 60 * 1000 // 1 hour
    });

    res.json({ message: 'Login successful with OTP' });

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Dashboard 
router.get('/dashboard', protect, (req, res) => {
  res.json({ message: 'Welcome to the Dashboard', userId: req.user });
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
