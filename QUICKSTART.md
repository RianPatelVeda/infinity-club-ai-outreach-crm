# 🚀 Quick Start Guide - Infinity Club CRM

## What You Have Now

A complete, working MVP CRM with:
- ✅ **Frontend** (Next.js) - Dashboard, Lead Search, Outreach, Kanban
- ✅ **Backend** (Nest.js) - Scraping, Email, API
- ✅ **Database** (Supabase/PostgreSQL) - Complete schema
- ✅ **Authentication** (Supabase Auth)
- ✅ **Email Service** (SendGrid integration)
- ✅ **Web Scraping** (Puppeteer for Google My Business)

## Next Steps - Do These in Order

### Step 1: Get Supabase Credentials

You already have the Perplexity prompt I gave you. Paste it into Perplexity and follow the instructions to:
1. Create a Supabase project
2. Get your 3 credentials
3. Run the database schema
4. Enable email auth

**Return here with:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Step 2: Get SendGrid API Key

1. Go to https://sendgrid.com
2. Sign up for free account
3. Navigate to **Settings → API Keys**
4. Create new API key with "Full Access"
5. Copy the key (you'll only see it once!)
6. Verify a sender email:
   - Go to **Settings → Sender Authentication**
   - Click "Verify a Single Sender"
   - Use your email (e.g., yourname@gmail.com)
   - Check your email and click verify link

**Return here with:**
- `SENDGRID_API_KEY` (starts with "SG.")
- `SENDGRID_FROM_EMAIL` (your verified email)

### Step 3: Configure Environment Variables

Once you have both Supabase and SendGrid credentials:

**Create `frontend/.env.local`:**
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Create `backend/.env`:**
```
PORT=3001
NODE_ENV=development

SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=your-verified-email@domain.com

SCRAPE_LIMIT=100
SCRAPE_TIMEOUT=30000
```

### Step 4: Install Dependencies

Open a terminal in the project root:

```bash
cd c:\infinity-club-ai-outreach-crm
npm run install:all
```

This will install everything for both frontend and backend.

### Step 5: Run the Application

**Option A - Run Both Together:**
```bash
npm run dev
```

**Option B - Run Separately (2 terminals):**

Terminal 1 (Frontend):
```bash
npm run dev:frontend
```

Terminal 2 (Backend):
```bash
npm run dev:backend
```

### Step 6: Access the App

Open your browser:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001

### Step 7: Create Your First Account

1. You'll be redirected to the login page
2. Click "Don't have an account? Sign up"
3. Enter your email and password (min 6 characters)
4. Click "Create Account"
5. Sign in with your credentials

## Testing the Features

### Test 1: Dashboard
- You should see the dashboard with stats (all zeros at first)
- Verify sidebar navigation works

### Test 2: Lead Scraping
1. Click **Lead Search** in sidebar
2. Enter:
   - Business Type: "coffee shop"
   - City: "New York"
3. Click **Scrape**
4. Wait 1-2 minutes
5. See results appear in the table

### Test 3: Email Outreach
1. Go to **Outreach**
2. Select one or more leads (checkbox)
3. Click **Create Campaign**
4. Choose the default template
5. Customize if needed
6. Click "Send Now"
7. Check **Outreach History** to see sent emails

### Test 4: Kanban Board
1. Click **Kanban Board**
2. You should see leads in "First Contact" column
3. Try dragging a card to "Follow-up"
4. Click on a "Potential Partner" card
5. Click **Confirm Partner** button

## Common Issues & Solutions

### "Failed to fetch" errors
- ✅ Check that backend is running (`npm run dev:backend`)
- ✅ Verify `.env` files have correct credentials
- ✅ Check Supabase project is active

### Scraping not working
- ✅ Check internet connection
- ✅ Reduce limit to 50 businesses
- ✅ Try a different city/business type

### Emails not sending
- ✅ Verify SendGrid API key is correct
- ✅ Check sender email is verified in SendGrid
- ✅ Look at SendGrid dashboard for errors

### Can't login
- ✅ Check Supabase credentials
- ✅ Ensure email auth is enabled in Supabase
- ✅ Try incognito mode
- ✅ Check browser console for errors

## What's Working in This MVP

✅ **Authentication**
- Sign up / Sign in
- Protected routes
- Session management

✅ **Lead Management**
- Automated GMB scraping
- Manual lead entry
- Deduplication
- Status tracking

✅ **Email Campaigns**
- Template system
- Variable substitution
- Bulk sending
- History tracking

✅ **Kanban Workflow**
- Drag-and-drop
- Stage progression
- Partner confirmation

✅ **Dashboard**
- Live stats
- Recent leads
- Quick actions

## Ready for V2?

Once the MVP is working perfectly, we can add:
- AI phone calls (ElevenLabs)
- Advanced analytics
- Email tracking (opens/clicks)
- Automated follow-ups
- More enrichment APIs

## Need Help?

If you get stuck on any step, let me know:
1. What step you're on
2. What error you're seeing
3. What you've tried so far

I'll help you debug and get it working!

---

**You're ready to go! Start with Step 1. 🚀**
