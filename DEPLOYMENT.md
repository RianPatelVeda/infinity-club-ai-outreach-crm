# Deployment Guide for Infinity Club AI Outreach CRM

This guide will walk you through deploying the application to Vercel.

## Overview

This application consists of:
- **Frontend**: Next.js 14 application
- **Backend**: NestJS API server

## Deployment Options

### Option 1: Deploy Both to Vercel (Recommended for simplicity)

#### Step 1: Deploy the Backend to Vercel

1. Install Vercel CLI (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. Navigate to the backend directory:
   ```bash
   cd backend
   ```

3. Deploy to Vercel:
   ```bash
   vercel
   ```

4. Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - What's your project's name? `infinity-club-backend`
   - In which directory is your code located? `./`
   - Want to override settings? **N**

5. After deployment, you'll get a URL like: `https://infinity-club-backend.vercel.app`

6. Set environment variables in Vercel Dashboard:
   - Go to your project in Vercel Dashboard
   - Settings → Environment Variables
   - Add these variables:
     - `SUPABASE_URL`: `https://ywquqvdyvlwnaqrugkls.supabase.co`
     - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
     - `SENDGRID_API_KEY`: Your SendGrid API key
     - `SENDGRID_FROM_EMAIL`: `rian@vedaai.co.uk`
     - `OUTSCRAPER_API_KEY`: Your Outscraper API key
     - `NODE_ENV`: `production`

7. Redeploy after adding environment variables:
   ```bash
   vercel --prod
   ```

#### Step 2: Deploy the Frontend to Vercel

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Update the `.env.local` file with your backend URL:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://ywquqvdyvlwnaqrugkls.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app
   ```

3. Deploy to Vercel:
   ```bash
   vercel
   ```

4. Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - What's your project's name? `infinity-club-frontend`
   - In which directory is your code located? `./`
   - Want to override settings? **N**

5. Set environment variables in Vercel Dashboard:
   - Go to your project in Vercel Dashboard
   - Settings → Environment Variables
   - Add these variables:
     - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
     - `NEXT_PUBLIC_API_URL`: Your backend URL from Step 1

6. Redeploy to production:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via GitHub (Recommended for CI/CD)

#### Step 1: Push to GitHub

1. Create a new repository on GitHub

2. Push your code:
   ```bash
   git remote add origin https://github.com/yourusername/your-repo.git
   git branch -M main
   git push -u origin main
   ```

#### Step 2: Deploy Backend via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Root Directory**: `backend`
   - **Framework Preset**: Other
   - Add all environment variables
5. Click "Deploy"

#### Step 3: Deploy Frontend via Vercel Dashboard

1. Add another project in Vercel
2. Import the same GitHub repository
3. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js
   - Add all environment variables (including backend URL from previous step)
4. Click "Deploy"

## Alternative Backend Deployment: Railway

If you encounter issues with Vercel for the backend, Railway is a great alternative:

1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Set root directory to `backend`
6. Add all environment variables
7. Deploy

Railway will provide you with a URL for your backend API.

## Post-Deployment Steps

1. Update CORS settings in the backend if needed
2. Verify all API endpoints are working
3. Test the email sending functionality
4. Test the lead scraping functionality

## Environment Variables Checklist

### Backend
- [ ] SUPABASE_URL
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] SENDGRID_API_KEY
- [ ] SENDGRID_FROM_EMAIL
- [ ] OUTSCRAPER_API_KEY
- [ ] NODE_ENV (set to "production")

### Frontend
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] NEXT_PUBLIC_API_URL (your deployed backend URL)

## Troubleshooting

### Backend Not Starting
- Check that all environment variables are set
- Review the deployment logs in Vercel dashboard
- Ensure the vercel.json configuration is correct

### Frontend Cannot Connect to Backend
- Verify the NEXT_PUBLIC_API_URL is correct
- Check CORS settings in backend
- Ensure backend is deployed and running

### Email Sending Issues
- Verify SendGrid API key is valid
- Check that sender email is verified in SendGrid
- Review backend logs for email errors

## Notes

- The backend vercel.json uses serverless functions, which may have cold start delays
- Consider using Railway or Render for the backend if you need persistent connections
- Make sure to secure your environment variables and never commit them to Git
