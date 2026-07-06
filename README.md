# BMS EarnHub

A full-stack MVP for a task/ad reward platform built with React, Node.js/Express, and Supabase.

This project is designed as a **membership + task reward platform**. Users activate a package, complete approved ads/simple tasks, earn wallet rewards, and request withdrawals once per day. It does **not** automatically guarantee profit just because a user paid for a package.

## Features

### User
- Register / login
- View dashboard, active package, wallet balance, and daily earning limit
- Select package and submit payment proof
- Complete available tasks / ad watching tasks
- Submit task proof
- Request withdrawal once per day
- View payment, task, wallet, and withdrawal history

### Admin
- Dashboard stats: users, payments, investments/package revenue, withdrawals, task submissions
- Approve/reject package payments
- Activate user packages
- Create/edit/deactivate earning packages
- Create/edit/deactivate tasks
- Approve/reject task submissions
- Pay/reject withdrawals
- Block/unblock users

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: Supabase PostgreSQL
- File Storage: Supabase Storage
- Auth: Custom JWT auth using Supabase DB table

## Folder Structure

```txt
bms-earnhub/
  backend/
  frontend/
  supabase/
```

## 1. Supabase Setup

1. Create a Supabase project.
2. Open SQL Editor.
3. Run `supabase/schema.sql`.
4. Create a public storage bucket named:

```txt
bms-files
```

5. Copy these values from Supabase:
   - Project URL
   - Service role key

Never expose the service role key in frontend code.

## 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Edit `.env`:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=change_this_to_a_long_secret
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_STORAGE_BUCKET=bms-files
```

## 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Edit `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## 4. Default Admin

The SQL file creates a default admin:

```txt
Email: admin@bmsearnhub.com
Password: Admin@12345
```

Change this password after first login.

## 5. Important Safety / Business Notes

Use wording like:

- Package activation
- Daily earning limit
- Task reward
- Up to earning limit

Avoid wording like:

- Guaranteed profit
- Fixed ROI
- Double your investment
- Earn without work

Real earning should come from actual completed tasks, advertiser revenue, or approved ad views.
