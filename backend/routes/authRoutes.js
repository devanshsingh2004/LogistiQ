const express = require('express');
const { firebaseAuth } = require('../middleware/firebaseAuth');
const router = express.Router();

// A test endpoint to verify token and get user info
router.get('/verify', firebaseAuth, (req, res) => {
  res.json({ uid: req.user.uid, email: req.user.email, role: req.user.role });
});

module.exports = router;
