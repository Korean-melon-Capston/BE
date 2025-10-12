const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// http://localhost:3000/auth/google 경로로 접속하면...
router.get('/google', authController.showGoogleLoginPage);

// http://localhost:3000/auth/callbackGoogle 경로로 접속하면...
router.get('/callbackGoogle', authController.handleGoogleCallback);

module.exports = router;
