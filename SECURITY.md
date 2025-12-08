# 🔒 Security Configuration Guide

## ⚠️ IMPORTANT: Environment Variables Setup

This project requires several API keys and secrets that are **NOT included** in the repository for security reasons.

### Required Environment Variables

#### Backend (.env)
```bash
# Copy from .env.example and fill with your actual values
cp Backend/.env.example Backend/.env
```

Required variables:
- `JWT_SECRET` - Generate a strong secret key
- `MONGODB_URI` - Your MongoDB connection string
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - From Google Cloud Console
- `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET` - From GitHub Developer Settings
- `GEMINI_API_KEY` - From Google AI Studio

#### Frontend (.env)
```bash
# Copy from .env.example and fill with your actual values
cp Frontend/.env.example Frontend/.env
```

### How to Get API Keys

#### 1. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs

#### 2. GitHub OAuth Setup
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL
4. Copy Client ID and Secret

#### 3. Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the generated key

### Security Best Practices

- ✅ Never commit `.env` files
- ✅ Use strong, unique secrets
- ✅ Rotate API keys regularly
- ✅ Use environment-specific configurations
- ✅ Enable 2FA on all accounts

### Production Deployment

For production, set environment variables through your hosting platform:
- Heroku: `heroku config:set VARIABLE_NAME=value`
- Vercel: Add in project settings
- AWS: Use Parameter Store or Secrets Manager
- Docker: Use secrets or environment files

## 🚨 Security Issues

If you find security vulnerabilities, please report them privately to the maintainers.