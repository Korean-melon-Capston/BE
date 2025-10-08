// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const { googleSignIn } = require('../controllers/authController');

// POST /api/auth/google
router.post('/google', googleSignIn);

module.exports = router;