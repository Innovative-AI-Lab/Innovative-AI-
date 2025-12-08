import { Router } from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import User from '../models/user.model.js';

const router = Router();

// Test route
router.get('/test', (req, res) => {
    res.json({ message: 'Auth routes working!' });
});

// Simple Google OAuth test
router.get('/google/test', (req, res) => {
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = 'http://localhost:4001/auth/google/callback';
    const googleAuthUrl = `https://accounts.google.com/oauth/authorize?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile`;
    res.redirect(googleAuthUrl);
});

// Google OAuth callback
router.get('/google/callback', async (req, res) => {
    try {
        const { code } = req.query;
        
        // Exchange code for access token
        const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            code,
            grant_type: 'authorization_code',
            redirect_uri: `http://localhost:4001/auth/google/callback`
        });

        const { access_token } = tokenResponse.data;

        // Get user info from Google
        const userResponse = await axios.get(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${access_token}`);
        const { email, name, picture } = userResponse.data;

        // Check if user exists
        let user = await User.findOne({ email });
        
        if (!user) {
            // Create new user
            user = await User.create({
                name,
                email,
                password: 'google_oauth', // Placeholder password
                avatar: picture
            });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

        // Redirect to frontend with token
        res.redirect(`${process.env.FRONTEND_URL}?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`);
    } catch (error) {
        console.error('Google OAuth error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
});

// GitHub OAuth callback
router.get('/github/callback', async (req, res) => {
    try {
        const { code } = req.query;
        
        // Exchange code for access token
        const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code
        }, {
            headers: { Accept: 'application/json' }
        });

        const { access_token } = tokenResponse.data;

        // Get user info from GitHub
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `token ${access_token}` }
        });

        const { login, email, name, avatar_url } = userResponse.data;

        // Get email if not public
        let userEmail = email;
        if (!userEmail) {
            const emailResponse = await axios.get('https://api.github.com/user/emails', {
                headers: { Authorization: `token ${access_token}` }
            });
            userEmail = emailResponse.data.find(e => e.primary)?.email;
        }

        // Check if user exists
        let user = await User.findOne({ email: userEmail });
        
        if (!user) {
            // Create new user
            user = await User.create({
                name: name || login,
                email: userEmail,
                password: 'github_oauth', // Placeholder password
                avatar: avatar_url
            });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

        // Redirect to frontend with token
        res.redirect(`${process.env.FRONTEND_URL}?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`);
    } catch (error) {
        console.error('GitHub OAuth error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
});

export default router;