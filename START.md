# 🚀 START HERE - You're Almost Ready!

## ✅ What's Already Done

- ✅ Supabase credentials configured
- ✅ Environment files created
- ✅ Dependencies are installing (wait for them to finish)

---

## 📋 **NEXT STEPS (Do These in Order)**

### **Step 1: Run the Database Schema** ⚠️ **DO THIS FIRST**

1. Go to: https://supabase.com/dashboard/project/ywquqvdyvlwnaqrugkls/sql
2. Click **New Query**
3. Open `database/schema.sql` in your project
4. Copy ALL the SQL code
5. Paste into Supabase SQL Editor
6. Click **Run** (green button)
7. Wait for "Success. No rows returned"

**Verify:**
- Go to **Table Editor** → You should see `leads`, `campaigns`, `kanban_stages`, etc.

---

### **Step 2: Get SendGrid API Key (For Email)**

1. Go to: https://sendgrid.com
2. Sign up for FREE account (no credit card needed)
3. Navigate to: **Settings → API Keys**
4. Click **Create API Key**
5. Name: "Infinity Club CRM"
6. Permissions: **Full Access**
7. Click **Create & View**
8. **COPY THE KEY** (you'll only see it once!)

**Then verify a sender email:**
1. Go to: **Settings → Sender Authentication**
2. Click **Verify a Single Sender**
3. Enter your email (can be Gmail, Outlook, etc.)
4. Check your email for verification link
5. Click the link to verify

**Update backend/.env:**
- Open `backend/.env`
- Replace `SENDGRID_API_KEY=your_sendgrid_key_here` with your actual key
- Replace `SENDGRID_FROM_EMAIL=your_verified_email@domain.com` with your verified email

---

### **Step 3: Wait for Dependencies to Finish**

Check if `npm install` is done in both terminals. You should see:
- `frontend/node_modules/` folder exists
- `backend/node_modules/` folder exists
- No errors in terminal

If it's taking too long (>5 minutes), stop and run:
```bash
cd frontend
npm install

cd ../backend
npm install
```

---

### **Step 4: Start the Application**

Open **TWO terminals**:

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```

Wait for: `Backend API running on http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Wait for: `Ready on http://localhost:3000`

---

### **Step 5: Access the App**

Open your browser: **http://localhost:3000**

You should see the **login page** with the Infinity Club logo!

---

## 🎯 **First Login**

1. Click **"Don't have an account? Sign up"**
2. Enter:
   - Email: your email
   - Password: at least 6 characters
3. Click **Create Account**
4. Sign in with same credentials
5. You'll see the **Dashboard**!

---

## 🧪 **Test the Features**

### Test 1: Dashboard
- Should see 4 stat cards (all zeros at first)
- Sidebar navigation should work

### Test 2: Add a Manual Lead
1. Click **Lead Search** in sidebar
2. Scroll down or click **+ NEW LEAD** button
3. Fill in:
   - Name: "Test Restaurant"
   - Business Type: "Restaurant"
   - City: "New York"
4. Add email/phone if you want
5. Click **Save**

### Test 3: Try Scraping (Optional)
1. Go to **Lead Search**
2. Enter:
   - Business Type: "coffee shop"
   - City: "New York"
3. Click **Scrape**
4. Wait 1-2 minutes
5. See results!

### Test 4: Kanban Board
1. Click **Kanban Board**
2. You should see your leads as cards
3. Try dragging a card to another column

### Test 5: Send Email (After SendGrid Setup)
1. Go to **Outreach**
2. Select a lead with an email
3. Click **Create Campaign**
4. Use the default template
5. Click **Send Now**
6. Check **Outreach History**

---

## ❌ **If Something Breaks**

### Backend won't start
- Check `backend/.env` has correct Supabase credentials
- Make sure port 3001 isn't already in use
- Look for error messages in terminal

### Frontend won't start
- Check `frontend/.env.local` exists
- Verify Supabase URL and key are correct
- Run `npm install` again if needed

### "Failed to fetch" errors
- Make sure backend is running on port 3001
- Check both .env files have matching Supabase URLs
- Verify you ran the database schema SQL

### Scraping doesn't work
- Check internet connection
- Try a different search term
- Reduce limit to 50 businesses
- Google may throttle automated requests

### Emails don't send
- Verify SendGrid API key in `backend/.env`
- Make sure sender email is verified in SendGrid
- Check SendGrid dashboard for error logs

---

## 📞 **Need Help?**

If you get stuck:
1. Check which step you're on
2. Read the error message carefully
3. Try the troubleshooting section above
4. Let me know what's happening and I'll help debug

---

## 🎉 **You're Ready!**

Once you:
1. ✅ Run the database schema in Supabase
2. ✅ Get SendGrid API key (optional for MVP testing)
3. ✅ Wait for `npm install` to finish
4. ✅ Start backend and frontend
5. ✅ Sign up and log in

**You have a working CRM!** 🚀

Start with Step 1 above. Let me know when the database schema is done and we'll move forward!
