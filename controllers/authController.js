// controllers/authControllers.js

const authService = require('../services/authServices');

const googleSignIn = async (req, res) => {
  try {
    const { googleIdToken } = req.body;
    if (!googleIdToken) {
      return res.status(400).json({ message: 'Google ID Token is required.' });
    }

    const appToken = await authService.authenticateWithGoogle(googleIdToken);

    res.status(200).json({
      message: 'User signed in successfully.',
      token: appToken,
    });
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    res.status(500).json({ message: 'Authentication failed.' });
  }
};

module.exports = { googleSignIn };