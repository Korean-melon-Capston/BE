// services/authServices.js

const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET;

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const authenticateWithGoogle = async (googleIdToken) => {
  const ticket = await googleClient.verifyIdToken({
    idToken: googleIdToken,
    audience: GOOGLE_CLIENT_ID,
  });
  const { email, name, picture, sub: googleId } = ticket.getPayload();

  let user = await User.findByEmail(email);

  if (!user) {
    const newUser = { email, name, googleId, profileImage: picture };
    user = await User.create(newUser);
  }

  const payload = { id: user.id, email: user.email, name: user.name };
  
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

  return token;
};

module.exports = { authenticateWithGoogle };