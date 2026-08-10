const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');
const db = require('../db'); // Project database instance

const JWT_SECRET = process.env.JWT_SECRET || 'talentnest_secure_jwt_secret_key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'talentnest_refresh_secret';
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// 1. Rate Limiter for Login Protection
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per window
  message: { message: 'Too many login attempts from this IP, please try again after 15 minutes' }
});

// Utility to issue JWT pairs and HttpOnly cookie
const generateAndSendTokens = async (res, hrUser, req) => {
  const payload = {
    id: hrUser.id,
    email: hrUser.email,
    role: hrUser.role || 'HR_ADMIN',
    companyId: hrUser.company_id
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: hrUser.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

  // Store refresh token hash & login audit trail in database
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const ipAddress = req.ip || req.connection.remoteAddress;

  await db.query(
    `UPDATE hr_users SET refresh_token = $1, last_login = NOW() WHERE id = $2`,
    [refreshToken, hrUser.id]
  );

  await db.query(
    `INSERT INTO login_history (hr_id, ip_address, device_info, provider) VALUES ($1, $2, $3, $4)`,
    [hrUser.id, ipAddress, userAgent, hrUser.provider || 'email']
  );

  // Secure HttpOnly Cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  return res.status(200).json({
    message: 'Authenticated successfully',
    accessToken,
    user: {
      id: hrUser.id,
      email: hrUser.email,
      name: hrUser.name,
      role: hrUser.role,
      company: hrUser.company_name
    }
  });
};

// --- Traditional HR Login API ---
router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Company email and password are required' });
  }

  try {
    const userResult = await db.query(
      `SELECT hr.*, c.name as company_name FROM hr_users hr 
       LEFT JOIN companies c ON hr.company_id = c.id 
       WHERE hr.email = $1`, 
      [email.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const hrUser = userResult.rows[0];

    if (!hrUser.is_active) {
      return res.status(403).json({ message: 'HR Account has been disabled. Contact system administrator.' });
    }

    if (!hrUser.is_email_verified) {
      return res.status(403).json({ code: 'EMAIL_NOT_VERIFIED', message: 'Email address not verified.' });
    }

    const isMatch = await bcrypt.compare(password, hrUser.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    hrUser.provider = 'email';
    await generateAndSendTokens(res, hrUser, req);
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Internal server security error' });
  }
});

// --- Google OAuth 2.0 API ---
router.post('/google', async (req, res) => {
  const { credential } = req.body;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const { email, name } = payload;

    let userResult = await db.query(`SELECT * FROM hr_users WHERE email = $1`, [email.toLowerCase()]);
    let hrUser;

    if (userResult.rows.length === 0) {
      // Automatic user creation for SSO
      const newUser = await db.query(
        `INSERT INTO hr_users (email, name, provider, is_email_verified, is_active) 
         VALUES ($1, $2, 'google', true, true) RETURNING *`,
        [email.toLowerCase(), name]
      );
      hrUser = newUser.rows[0];
    } else {
      hrUser = userResult.rows[0];
    }

    hrUser.provider = 'google';
    await generateAndSendTokens(res, hrUser, req);
  } catch (err) {
    console.error('Google Auth Error:', err);
    res.status(401).json({ message: 'Google authentication token invalid' });
  }
});

// --- Microsoft Entra ID SSO API ---
router.post('/microsoft', async (req, res) => {
  const { accessToken } = req.body;
  try {
    // Validate token against Microsoft Graph API
    const graphResponse = await axios.get('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    const { mail, userPrincipalName, displayName } = graphResponse.data;
    const email = (mail || userPrincipalName).toLowerCase();

    let userResult = await db.query(`SELECT * FROM hr_users WHERE email = $1`, [email]);
    let hrUser;

    if (userResult.rows.length === 0) {
      const newUser = await db.query(
        `INSERT INTO hr_users (email, name, provider, is_email_verified, is_active) 
         VALUES ($1, $2, 'microsoft', true, true) RETURNING *`,
        [email, displayName]
      );
      hrUser = newUser.rows[0];
    } else {
      hrUser = userResult.rows[0];
    }

    hrUser.provider = 'microsoft';
    await generateAndSendTokens(res, hrUser, req);
  } catch (err) {
    console.error('Microsoft Auth Error:', err);
    res.status(401).json({ message: 'Microsoft token verification failed' });
  }
});

// --- Silent Refresh Token Handler ---
router.post('/refresh-token', async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: 'Refresh token missing' });

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const userResult = await db.query(`SELECT * FROM hr_users WHERE id = $1 AND refresh_token = $2`, [decoded.id, refreshToken]);
    
    if (userResult.rows.length === 0) return res.status(403).json({ message: 'Invalid refresh token' });

    const hrUser = userResult.rows[0];
    const newAccessToken = jwt.sign(
      { id: hrUser.id, email: hrUser.email, role: hrUser.role }, 
      JWT_SECRET, 
      { expiresIn: '15m' }
    );

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(403).json({ message: 'Expired or revoked refresh token' });
  }
});

// --- Secure Logout ---
router.post('/logout', async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    await db.query(`UPDATE hr_users SET refresh_token = NULL WHERE refresh_token = $1`, [refreshToken]);
  }
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;