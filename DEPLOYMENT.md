# Deploying Formulate to Vercel

This guide explains how to deploy the Formulate application to Vercel.

## Project Structure

Formulate is a monorepo with two main parts:
- `client/` - React frontend application
- `server/` - Node.js/Express backend API

## Configuration Files

The project includes several configuration files for deployment:

1. **Root `vercel.json`**
   - Configures both frontend and backend deployments
   - Specifies routing between client and server
   - Defines build settings for both parts

2. **Client `vercel.json`**
   - Specifies the output directory (`build`) for the client
   - Sets the build command

## Deployment Options

### Option 1: Deploy from Git Repository (Recommended)

1. Import your GitHub/GitLab/Bitbucket repository in the Vercel dashboard
2. Vercel will automatically detect the project structure
3. Use the following build settings:
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `client/build`
   - **Install Command**: `npm run install-all`

### Option 2: Deploy Using Vercel CLI

1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to your project directory
3. Run `vercel` and follow the prompts
4. When prompted for settings, use:
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `client/build`
   - **Development Command**: `npm run dev`

## Troubleshooting

### "No Output Directory" Error

If you encounter the "No Output Directory" error:

1. Check Project Settings in Vercel Dashboard
   - Go to your project
   - Navigate to Settings > General
   - Under "Build & Development Settings", make sure:
     - **Output Directory** is set to `client/build`
     - **Build Command** is set to `npm run vercel-build`

2. Manually override settings
   - Go to your project
   - Navigate to Settings > General
   - Select "Override" next to Build & Development Settings
   - Set **Framework Preset** to "Other"
   - Set **Build Command** to `npm run vercel-build`
   - Set **Output Directory** to `client/build`

### API Connection Issues

If the frontend can't connect to the backend:

1. Make sure the API URL in your frontend code is pointing to the deployed backend URL
2. Check that the routes in `vercel.json` are correctly configured
3. Verify that CORS is properly configured in your server code

## Environment Variables

Set these environment variables in your Vercel project:

- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Secret for JWT tokens
- `NODE_ENV`: Set to `production`
- Any other environment variables your application uses 