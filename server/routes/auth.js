const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');


// Signup route
router.post('/signup', async (req, res) => {
  const { name, email, password, address, number } = req.body;
  if (!name || !email || !password || !address || !number) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword, address, number });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login
// POST /api/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "All fields are required." });

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "Invalid email or password." });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ error: "Invalid email or password." });

  // Success: you can return user info or a token
  res.json({ message: "Login successful", user: { name: user.name, email: user.email } });
});

// Get user details (protected route, for demo use email in query)
router.get('/user', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "Email required" });
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user });
});

// Update user details
router.put('/user', async (req, res) => {
  const { email, name, address, number } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });
  const user = await User.findOneAndUpdate(
    { email },
    { name, address, number },
    { new: true }
  );
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user, message: "User updated" });
});



module.exports = router;
