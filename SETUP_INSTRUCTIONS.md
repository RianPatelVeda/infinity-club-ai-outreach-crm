# Setup Instructions: Getting Your API Keys

This guide will walk you through creating accounts and obtaining the necessary API keys and URLs for the Infinity Club AI Partner Outreach CRM.

## 📋 What You'll Need to Collect

By the end of this guide, you'll have:
- ✅ Supabase URL
- ✅ Supabase Anon Key
- ✅ Supabase Service Role Key
- ✅ SendGrid API Key
- ✅ SendGrid Verified Sender Email

---

## 1️⃣ Supabase Setup (Database & Authentication)

### Step 1: Create a Supabase Account
1. Go to **https://supabase.com**
2. Click **"Start your project"** or **"Sign Up"**
3. Sign up with GitHub, Google, or email
4. Verify your email if required

### Step 2: Create a New Project
1. Click **"New Project"** on the dashboard
2. Fill in the project details:
   - **Name**: `infinity-club-crm` (or any name you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to you (e.g., `us-east-1`)
   - **Pricing Plan**: Select **Free** tier
3. Click **"Create new project"**
4. Wait 2-3 minutes for project setup to complete

### Step 3: Get Your Supabase Credentials
1. Once the project is ready, go to **Settings** (gear icon in sidebar)
2. Click **"API"** in the settings menu
3. You'll see the following - **COPY THESE VALUES**:

   ```
   Project URL: https://xxxxxxxxxxxxx.supabase.co
   ```
   📝 **Copy this** - This is your `SUPABASE_URL`

   Under **"Project API keys"** section:
   ```
   anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   📝 **Copy this** - This is your `SUPABASE_ANON_KEY`

   ```
   service_role (secret): eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   📝 **Copy this** - This is your `SUPABASE_SERVICE_ROLE_KEY`
   ⚠️ **IMPORTANT**: Keep service_role key secret - it bypasses all security!

### Step 4: Set Up Database Schema
1. In Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Open the file `database/schema.sql` from this project
4. Copy the entire contents and paste into the SQL Editor
5. Click **"Run"** or press `Ctrl+Enter`
6. You should see "Success. No rows returned" - this is correct!

### Step 5: Enable Email Authentication
1. Go to **Authentication** → **Providers** in the sidebar
2. Find **"Email"** provider
3. Make sure it's **enabled** (toggle should be green)
4. Scroll down and click **"Save"**

---

## 2️⃣ SendGrid Setup (Email Delivery)

### Step 1: Create SendGrid Account
1. Go to **https://sendgrid.com**
2. Click **"Start for Free"** or **"Sign Up"**
3. Fill in the registration form:
   - Email address
   - Password
   - Company details (can be personal/individual)
4. Verify your email address (check inbox)
5. Complete any additional verification steps

### Step 2: Create API Key
1. Log in to SendGrid dashboard
2. Click **"Settings"** in the left sidebar
3. Click **"API Keys"**
4. Click **"Create API Key"** (blue button, top right)
5. Fill in the details:
   - **API Key Name**: `infinity-club-crm` (or any descriptive name)
   - **API Key Permissions**: Select **"Full Access"**
     - (Alternatively, select "Restricted Access" and enable only "Mail Send" if you want tighter security)
6. Click **"Create & View"**
7. **COPY THE API KEY IMMEDIATELY** - You won't see it again!
   ```
   SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   📝 **Copy this** - This is your `SENDGRID_API_KEY`

### Step 3: Verify Sender Email
SendGrid requires you to verify the email address you'll send from.

1. In SendGrid dashboard, click **"Settings"** → **"Sender Authentication"**
2. Click **"Get Started"** under **"Single Sender Verification"**
   - (Note: For production, use "Domain Authentication" instead)
3. Click **"Create New Sender"**
4. Fill in the form:
   - **From Name**: `Infinity Club` (or your company name)
   - **From Email Address**: Your email (e.g., `noreply@yourdomain.com` or personal email)
   - **Reply To**: Same as above or different email
   - Fill in address details (required by SendGrid)
5. Click **"Create"**
6. Check your email inbox and click the verification link
7. Once verified, you'll see a green checkmark

📝 **Copy your verified email** - This is your `SENDGRID_FROM_EMAIL`

---

## 3️⃣ Fill in Your Environment Variables

Now that you have all the credentials, update your `.env` files:

### Frontend (.env.local)
Open `frontend/.env.local` and replace:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Backend (.env)
Open `backend/.env` and replace:

```bash
PORT=3001
NODE_ENV=development

SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

SCRAPE_LIMIT=100
SCRAPE_TIMEOUT=30000
```

---

## 4️⃣ Quick Reference Checklist

Use this to track your progress:

- [ ] Supabase account created
- [ ] Supabase project created
- [ ] Copied `SUPABASE_URL`
- [ ] Copied `SUPABASE_ANON_KEY`
- [ ] Copied `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Database schema uploaded and run
- [ ] Email authentication enabled
- [ ] SendGrid account created
- [ ] SendGrid API key created and copied
- [ ] Sender email verified
- [ ] Both `.env` files updated with real values
- [ ] Ready to run `npm run install:all`
- [ ] Ready to run `npm run dev`

---

## 5️⃣ Summary: Values to Copy

Here's a quick template to fill out as you go:

```
=== SUPABASE ===
Project URL: _________________________________
Anon Key: _________________________________
Service Role Key: _________________________________

=== SENDGRID ===
API Key: _________________________________
Verified Sender Email: _________________________________
```

---

## 🆘 Troubleshooting

### Supabase Issues
- **Can't find API keys**: Settings → API
- **Database schema failed**: Check for syntax errors, ensure you copied the entire schema
- **Can't create project**: Free tier allows 2 projects max

### SendGrid Issues
- **API key not working**: Ensure you selected "Full Access" or enabled "Mail Send"
- **Emails not sending**: Check sender email is verified (green checkmark)
- **Account suspended**: Complete sender verification and avoid sending spam

---

## 🎉 Next Steps

Once you have all values filled in:

1. Run `npm run install:all` to install dependencies
2. Run `npm run dev` to start the application
3. Visit `http://localhost:3000`
4. Create an account and start using the CRM!

---

## 📧 Need Help?

If you run into issues:
1. Double-check all API keys are copied correctly (no extra spaces)
2. Ensure `.env` files are in the correct directories
3. Restart the development server after changing `.env` files
4. Check the console for specific error messages
