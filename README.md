# LEADFLOW – Next.js + Supabase (Technical Test Submission)

This repository contains my complete submission for the **LEARNLYNK Technical Assessment**, covering all 5 sections:

- Supabase schema design  
- RLS policies  
- Edge Function implementation  
- Frontend task dashboard  
- Stripe integration explanation (quoted verbatim)

The project is built with **Next.js 14 (App Router)**, **Supabase**, **React Query**, and **TypeScript**.

---

## 🗂 Repository Structure Overview

LEADFLOW-NEXTJS-SUPABASE
├── src/
│   ├── app/                 
│   ├── components/          
│   ├── lib/                 
│   └── providers/           
├── supabase/
│   └── functions/           
├── supabaseSchema/          
└── README.md

This layout follows modern Next.js conventions and provides clear separation between UI, logic, and backend functions.

---

# SECTION 1 — Supabase Schema  
📄 **Location:** `supabaseSchema/database.sql`

This file contains:

- **Tables:** `leads`, `applications`, `tasks`  
- Required fields: `id`, `tenant_id`, `created_at`, `updated_at`  
- Relationships:  
  - `applications.lead_id → leads.id`  
  - `tasks.related_id → applications.id`  
- Constraints:  
  - CHECK (`task.type` is one of `'call' | 'email' | 'review'`)  
  - CHECK (`tasks.due_at >= created_at`)  
- Indexes for: owner, stage, created_at, fetch by lead, fetch tasks due today

The schema runs directly inside Supabase SQL Editor.

---

# SECTION 2 — RLS & Policies  
📄 **Location:** Inside `database.sql` below schema definition

RLS is enabled on all tables.

### Leads Policy Rules  
- **Admins:** full access  
- **Counselors:** may read  
  - leads assigned to them, or  
  - leads assigned to their team  
- **Counselors Insert:**  
  - `owner_id = auth.uid()`  
  - `team_id` must be one of the counselor’s teams  

JWT role is read via `auth.jwt()->>'role'`.

---

# SECTION 3 — Edge Function (create-task)  
📄 **Location:** `supabase/functions/createTask/index.ts`

This Edge Function:

1. Accepts POST body with:  
   - `application_id`, `task_type`, `due_at`, `title`, `tenant_id`  
2. Validates:  
   - required fields  
   - allowed task types: `call`, `email`, `review`  
   - future `due_at`  
3. Inserts using **Service Role client**  
4. Emits a Realtime broadcast event (`task.created`)  
5. Returns structured JSON with status and `task_id`

---

# SECTION 4 — Next.js Frontend (`/dashboard/today`)  
📄 **Location:** `src/app/dashboard/today/page.tsx`

This page demonstrates:

- Protected route using global **AuthContext**  
- Fetching today's tasks using **React Query**  
- Display in `TasksTable`  
- Mark-complete mutation  
- Auto-refetch  
- Full loading and error UI  

---

# SECTION 5 — Stripe Checkout Integration

Frontend stores the application ID. When the user clicks Pay, the frontend sends the application ID to the backend. The backend verifies the authenticated user and confirms the application belongs to them. The backend then creates a Stripe Checkout Session and stores a pending payment record in the database with Stripe metadata. The backend redirects the frontend to Stripe redirection URL. After the user completes payment, Stripe returns the result to the backend by connected webhook. The backend verifies the webhook signature, updates the payment status. Frontend fetches the updated payment status from the database.

---

# 🚀 Running the Project

### 1. Install dependencies  
npm install

### 2. Add environment variables  
Copy `.sample.env.local` → `.env.local`

### 3. Start development server  
npm run dev

### 4. Supabase Resources  
- Schema: `supabaseSchema/database.sql`  
- Edge Function: `supabase/functions/createTask/`

---

# 🛠️ Tech Stack

- Next.js 14  
- Supabase  
- TypeScript  
- React Query  
- TailwindCSS  

---

# 📌 Summary

This solution demonstrates:

- Strong schema design  
- Access control with RLS  
- Edge Functions  
- Frontend async workflows  
- Stripe integration understanding  
- Clean file structure  
