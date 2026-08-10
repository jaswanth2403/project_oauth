const express = require('express');
const authenticateToken = require('./authMiddleware');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

const router = express.Router();

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);


// ========================================
// 1. Start Google OAuth/OIDC login
// ========================================

router.get('/google', (req, res) => {

  const googleAuthUrl =
    'https://accounts.google.com/o/oauth2/v2/auth' +
    `?client_id=${encodeURIComponent(process.env.GOOGLE_CLIENT_ID)}` +
    `&redirect_uri=${encodeURIComponent(process.env.GOOGLE_REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent('openid email profile')}`;

  res.redirect(googleAuthUrl);
});


// ========================================
// 2. Google OAuth/OIDC callback
// ========================================

router.get('/google/callback', async (req, res) => {

  try {

    const code = req.query.code;

    if (!code) {
      return res.status(400).json({
        message: 'Authorization code missing'
      });
    }


    // ------------------------------------
    // Exchange authorization code
    // for Google tokens
    // ------------------------------------

    const { tokens } = await googleClient.getToken(code);

    console.log('Google tokens received');


    // ------------------------------------
    // Verify Google's ID token
    // ------------------------------------

    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });


    // ------------------------------------
    // Get verified user information
    // ------------------------------------

    const payload = ticket.getPayload();

    const user = {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture
    };

    console.log('Verified Google user:', user);


    // ------------------------------------
    // Create YOUR application's JWT
    // ------------------------------------

    const appToken = jwt.sign(
      {
        userId: user.googleId,
        email: user.email,
        name: user.name
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h'
      }
    );


    // ------------------------------------
    // Send JWT to frontend
    // ------------------------------------

    res.json({
      message: 'Login successful',
      token: appToken,
      user
    });

  } catch (error) {

    console.error('Google authentication error:', error);

    res.status(500).json({
      message: 'Authentication failed'
    });
  }
});


// ========================================
// 3. Protected route
// ========================================

router.get('/me', authenticateToken, (req, res) => {

  res.json({
    message: 'You are authenticated',
    user: req.user
  });

});


module.exports = router;