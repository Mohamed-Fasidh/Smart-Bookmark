# Smart Bookmark App

A full-stack bookmark manager built using Next.js (App Router), Supabase, and Tailwind CSS.

Live URL: https://smart-bookmark-mohamed-fasidhs-projects.vercel.app  
GitHub Repo: https://github.com/Mohamed-Fasidh/Smart-Bookmark

---

##  Features

- Google OAuth authentication (no email/password)
- Private bookmarks per user
- Add bookmark (title + URL + category)
- Delete bookmark
- Real-time updates using Supabase Realtime
- Search filter
- Category filter (Work, Shopping, Learning, Social, General)
- Dark premium UI design
- Deployed on Vercel

---

##  Tech Stack

- **Frontend:** Next.js 14 (App Router)
- **Backend & Database:** Supabase (Auth + PostgreSQL + Realtime)
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **Deployment:** Vercel

---

##  Authentication

- Implemented using Supabase Google OAuth.
- Users can log in only via Google.
- Session is managed using Supabase client SDK.

---

##  Database Schema

Table: `bookmarks`

| Column      | Type        |
|------------|------------|
| id         | uuid (Primary Key) |
| title      | text       |
| url        | text       |
| category   | text       |
| user_id    | uuid (Foreign Key) |
| created_at | timestamp  |

Row-Level Security (RLS) is enabled to ensure users can only access their own bookmarks.

---

##  Real-Time Updates

Supabase Realtime is used to subscribe to changes in the `bookmarks` table filtered by `user_id`.

When a bookmark is:
- Added
- Deleted

The UI updates instantly without refreshing the page.

---


### Local Development
Create a `.env.local` file and add the variables.

### Production (Vercel)
Go to:
Project → Settings → Environment Variables  
Add the same variables there.

---

##  Installation (Local Setup)

```bash
git clone <repo-url>
cd smart-bookmark
npm install
npm run dev
Visit:

http://localhost:3000
```

## Problems Faced & Solutions
1 Blank page after Vercel deployment

Problem:
The app returned null while session state was loading, causing a blank screen in production.

Solution:
Implemented a proper login UI instead of returning null.
Handled session loading safely to avoid rendering issues.

2 Real-time updates not reflecting instantly

Problem:
Bookmarks updated only after page refresh.

Solution:

Added optimistic UI updates for insert/delete actions.