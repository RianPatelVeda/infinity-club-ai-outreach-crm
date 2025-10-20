# ✅ Setup Checklist - Infinity Club CRM

Use this checklist to ensure everything is configured correctly.

## Pre-Installation Checklist

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Git installed (optional, for version control)
- [ ] Code editor installed (VS Code recommended)

## Supabase Setup Checklist

- [ ] Created Supabase account at https://supabase.com
- [ ] Created new Supabase project
- [ ] Copied `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Copied `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Copied `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Ran database schema from `database/schema.sql` in SQL Editor
- [ ] Verified tables were created (check Table Editor)
- [ ] Enabled Email provider in Authentication → Providers
- [ ] Confirmed no errors in SQL Editor

## SendGrid Setup Checklist

- [ ] Created SendGrid account at https://sendgrid.com
- [ ] Created API Key with Full Access
- [ ] Copied `SENDGRID_API_KEY` (starts with "SG.")
- [ ] Verified sender email address
- [ ] Received verification confirmation email
- [ ] Clicked verification link in email
- [ ] Sender email shows as "Verified" in SendGrid dashboard

## Environment Variables Checklist

### Frontend (`frontend/.env.local`)

- [ ] File created at `frontend/.env.local`
- [ ] `NEXT_PUBLIC_SUPABASE_URL` is set
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set
- [ ] `NEXT_PUBLIC_API_URL=http://localhost:3001` is set
- [ ] No syntax errors (no quotes around values, no spaces)

### Backend (`backend/.env`)

- [ ] File created at `backend/.env`
- [ ] `PORT=3001` is set
- [ ] `NODE_ENV=development` is set
- [ ] `SUPABASE_URL` is set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set
- [ ] `SENDGRID_API_KEY` is set
- [ ] `SENDGRID_FROM_EMAIL` is set (your verified email)
- [ ] `SCRAPE_LIMIT=100` is set
- [ ] `SCRAPE_TIMEOUT=30000` is set

## Installation Checklist

- [ ] Ran `npm run install:all` from project root
- [ ] Frontend dependencies installed (check `frontend/node_modules`)
- [ ] Backend dependencies installed (check `backend/node_modules`)
- [ ] No error messages during installation
- [ ] Puppeteer downloaded successfully (backend)

## Running the Application Checklist

- [ ] Backend starts without errors (`npm run dev:backend`)
- [ ] Backend shows "Backend API running on http://localhost:3001"
- [ ] Frontend starts without errors (`npm run dev:frontend`)
- [ ] Frontend shows "compiled successfully"
- [ ] No red errors in terminal
- [ ] Can access http://localhost:3000 in browser
- [ ] Can access http://localhost:3001 in browser (shows "Cannot GET /")

## First Login Checklist

- [ ] Browser redirects to /login page
- [ ] Login page displays correctly (Infinity Club logo, form)
- [ ] Can click "Sign up" link
- [ ] Can enter email and password
- [ ] "Create Account" button works
- [ ] No console errors (press F12)
- [ ] Can sign in with credentials
- [ ] Redirected to /dashboard after login

## Dashboard Checklist

- [ ] Dashboard loads without errors
- [ ] See 4 stat cards (New Leads, Enriched Leads, etc.)
- [ ] Sidebar navigation visible
- [ ] Header shows user email
- [ ] "NEW LEAD" button visible
- [ ] Can click sidebar links (Lead Search, Kanban, etc.)

## Lead Search & Scraping Checklist

- [ ] Lead Search page loads
- [ ] Can enter business type and city
- [ ] "Scrape" button works
- [ ] Backend console shows scraping activity
- [ ] Results appear in table after 1-2 minutes
- [ ] Leads have names, cities, etc.
- [ ] Status badges show correctly
- [ ] No duplicate leads (run same search twice)

## Email Outreach Checklist

- [ ] Outreach page loads
- [ ] Can see leads with email addresses
- [ ] Can select leads with checkboxes
- [ ] "Create Campaign" button appears
- [ ] Email panel opens on right side
- [ ] Can select/edit template
- [ ] Can customize subject and content
- [ ] "Send Campaign" button works
- [ ] Outreach history shows sent emails
- [ ] Check SendGrid dashboard for sent emails

## Kanban Board Checklist

- [ ] Kanban page loads
- [ ] See 5 columns (First Contact → Confirmed Partner)
- [ ] Leads appear as cards
- [ ] Can drag cards between columns
- [ ] Card details show correctly
- [ ] "Confirm Partner" button works on Potential Partner cards
- [ ] Confirmed partners move to final column

## Database Verification Checklist

Go to Supabase → Table Editor and verify:

- [ ] `leads` table exists and has data
- [ ] `kanban_stages` table has 5 rows
- [ ] `campaigns` table exists
- [ ] `email_templates` table has default template
- [ ] `outreach_history` table has records after sending emails
- [ ] `lead_kanban` table maps leads to stages

## Common Error Fixes

### "Cannot find module" errors
```bash
cd frontend
npm install

cd ../backend
npm install
```

### "Failed to fetch" errors
- Check backend is running
- Verify API_URL in frontend/.env.local
- Check Supabase credentials

### "Scraping failed" errors
- Check internet connection
- Reduce scrape limit to 50
- Try different search terms

### "Email failed" errors
- Verify SendGrid API key
- Check sender email is verified
- Look at SendGrid Activity Feed

### "Cannot connect to Supabase" errors
- Verify Supabase project is active
- Check credentials match exactly
- Test connection in Supabase dashboard

## Testing Checklist (Manual QA)

### User Authentication
- [ ] Can sign up new user
- [ ] Can sign in existing user
- [ ] Can sign out
- [ ] Protected routes redirect to login

### Lead Management
- [ ] Can scrape new leads
- [ ] Can add manual lead
- [ ] Duplicate detection works
- [ ] Lead data persists after refresh

### Email Campaigns
- [ ] Can create campaign
- [ ] Variables are replaced correctly
- [ ] Emails actually send (check inbox)
- [ ] History is recorded

### Kanban Workflow
- [ ] Can drag and drop cards
- [ ] Changes persist after refresh
- [ ] Can confirm partners
- [ ] Filters work

### UI/UX
- [ ] All pages load quickly
- [ ] No broken images or styles
- [ ] Responsive on different screen sizes
- [ ] No console errors (F12)

## Performance Checklist

- [ ] Dashboard loads in < 2 seconds
- [ ] Tables handle 100+ leads smoothly
- [ ] Search/filter is responsive
- [ ] No memory leaks (check Task Manager)
- [ ] Backend API responds quickly

## Security Checklist

- [ ] `.env` files are not committed to git
- [ ] Service role key is kept secret
- [ ] RLS policies are enabled in Supabase
- [ ] Auth is required for all protected routes
- [ ] No sensitive data in browser console

## Ready for Production?

Before deploying to production:

- [ ] All MVP features working
- [ ] No critical bugs
- [ ] Error handling in place
- [ ] Environment variables for production
- [ ] Database backups configured
- [ ] Monitoring/logging set up

---

## You're Done! 🎉

If you've checked all these boxes, your MVP is ready to use!

Start adding real leads and running campaigns.

When you're ready for V2 features, let me know!
