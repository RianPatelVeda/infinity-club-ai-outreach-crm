# Infinity Club AI Partner Outreach CRM

A full-stack CRM application for automated partner outreach, lead scraping, and relationship management.

## 🚀 Features

- **Lead Search & Scraping**: Automated Google My Business scraping with deduplication
- **Manual Lead Entry**: Add leads manually with validation
- **Email Outreach**: Template-based email campaigns with variable substitution
- **Kanban Board**: Visual pipeline management with drag-and-drop
- **Dashboard**: Real-time analytics and lead tracking
- **Outreach History**: Complete audit trail of all communications

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** (React, TypeScript)
- **Tailwind CSS** for styling
- **Supabase Auth** for authentication
- **React Query** for data fetching
- **DnD Kit** for drag-and-drop

### Backend
- **Nest.js** (Node.js framework)
- **Puppeteer** for web scraping
- **SendGrid** for email delivery
- **Supabase** (PostgreSQL database)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18+ and npm
- Git

You'll also need accounts for:
- Supabase (free tier)
- SendGrid (free tier - 100 emails/day)

## 🔧 Installation

### 1. Clone the Repository

```bash
cd c:\infinity-club-ai-outreach-crm
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm run install:all
```

This will install dependencies for both frontend and backend.

### 3. Set Up Supabase

Follow the instructions you received from Perplexity to:
1. Create a Supabase project
2. Get your credentials (URL, anon key, service role key)
3. Run the database schema from `database/schema.sql`
4. Enable email authentication

### 4. Set Up SendGrid

1. Go to [SendGrid](https://sendgrid.com) and create a free account
2. Create an API key with "Full Access"
3. Verify a sender email address

### 5. Configure Environment Variables

#### Frontend (.env)

Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### Backend (.env)

Create `backend/.env`:

```bash
PORT=3001
NODE_ENV=development

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# SendGrid
SENDGRID_API_KEY=SG.your_api_key_here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Scraping
SCRAPE_LIMIT=100
SCRAPE_TIMEOUT=30000
```

## 🚀 Running the Application

### Development Mode

Run both frontend and backend concurrently:

```bash
npm run dev
```

Or run them separately:

```bash
# Frontend (Terminal 1)
npm run dev:frontend

# Backend (Terminal 2)
npm run dev:backend
```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## 👤 First Login

1. Navigate to http://localhost:3000
2. You'll be redirected to the login page
3. Click "Don't have an account? Sign up"
4. Create an account with your email
5. Sign in and start using the CRM!

## 📚 Using the CRM

### 1. Lead Search & Scraping

1. Navigate to **Lead Search** in the sidebar
2. Enter a business type (e.g., "Luxury Hotels")
3. Enter a city (e.g., "New York")
4. Click **Scrape**
5. Wait for results (1-2 minutes)

### 2. Email Outreach

1. Go to **Outreach**
2. Select leads
3. Click **Create Campaign**
4. Customize email template
5. Send or schedule

### 3. Kanban Board

1. Navigate to **Kanban Board**
2. Drag and drop cards between stages
3. Click **Confirm Partner** to finalize

## 🐛 Troubleshooting

### Scraping Issues
- Check internet connection
- Reduce scrape limit to 50
- Try again later if blocked

### Email Not Sending
- Verify SendGrid API key
- Check sender email is verified
- Ensure leads have valid emails

### Database Errors
- Verify Supabase credentials
- Ensure schema was run successfully
- Check RLS policies

## 📈 Roadmap (V2)

- [ ] AI phone call outreach (ElevenLabs)
- [ ] Advanced analytics
- [ ] Auto-move Kanban on email replies
- [ ] Email tracking (opens/clicks)
- [ ] Bulk import/export

## 📄 License

Proprietary - Infinity Club © 2025
