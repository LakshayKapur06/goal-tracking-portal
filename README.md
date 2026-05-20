<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/target.svg" alt="GoalTracker Logo" width="80" height="80">
  <h1>Goal Setting & Tracking Portal</h1>
  <p><em>An enterprise-grade, full-stack web portal for structured goal creation, approval workflows, quarterly check-ins, and organization-wide performance analytics.</em></p>
  
  [![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://goal-tracking-portal-jade.vercel.app)
  [![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://supabase.com)
  [![Auth.js](https://img.shields.io/badge/Auth.js_v5-6C47FF?style=for-the-badge&logo=auth0&logoColor=white)](https://authjs.dev)
</div>

<br />

## 🔗 Live Prototype

> **[https://goal-tracking-portal-jade.vercel.app](https://goal-tracking-portal-jade.vercel.app)**

### Demo Credentials

| Role | Email | Password | Access Level |
|:---|:---|:---|:---|
| 👨‍💼 **Admin** | `admin@company.com` | `password123` | Analytics, Cycle Management, Audit Logs, CSV Export |
| 🧑‍🏫 **Manager** | `manager@company.com` | `password123` | Team Goal Review, Inline Editing, Quarterly Feedback |
| 👨‍💻 **Employee** | `employee@company.com` | `password123` | Goal Creation, Weightage Allocation, Check-in Logging |

> Microsoft Entra ID (Azure AD) SSO is fully integrated for enterprise environments.

---

## 📋 Problem Statement

Organizations that rely on manual or fragmented goal-tracking methods struggle with alignment, visibility, and accountability. This portal digitizes the **entire goal lifecycle** — from creation and approval to quarterly check-ins and performance analytics — while enforcing strict role-based hierarchy constraints.

---

## ✅ Features Implemented

### Phase 1: Goal Creation & Approval (Must-Have)

| Requirement | Status | Implementation |
|:---|:---:|:---|
| Employee creates up to 8 goals | ✅ | Server-side count validation before `INSERT` |
| Goals mapped to Thrust Areas | ✅ | Financial, Customer, Internal Process, Learning & Development |
| 4 Units of Measurement (UoM) | ✅ | MIN, MAX, TIMELINE, ZERO with graduated scoring |
| Minimum 10% weightage per goal | ✅ | Client + server-side validation |
| Total weightage must equal 100% | ✅ | Real-time progress bar + server-side enforcement |
| Manager inline-edit of targets | ✅ | Editable fields with diff-based audit logging |
| Manager approve (lock) or return | ✅ | Status transitions: DRAFT → PENDING → LOCKED / DRAFT |
| Notification on submit/approve | ✅ | `NotificationLog` entries created on each state change |

### Phase 2: Achievement Tracking & Check-ins (Must-Have)

| Requirement | Status | Implementation |
|:---|:---:|:---|
| Quarterly check-in (Q1–Q4) | ✅ | Tab-based UI with `UPSERT` for idempotent updates |
| Planned vs Actual comparison | ✅ | Side-by-side display on Manager Check-in view |
| Automated progress scoring | ✅ | Graduated algorithm per UoM type (not binary) |
| Manager structured feedback | ✅ | Textarea per goal per quarter, persisted in DB |

### Phase 3: Bonus Features

| Feature | Status | Implementation |
|:---|:---:|:---|
| SSO (Azure AD / Entra ID) | ✅ | NextAuth.js v5 `MicrosoftEntraID` provider configured |
| Admin Analytics Dashboard | ✅ | Chart.js bar + pie charts with live DB aggregation |
| CSV Export | ✅ | `/api/export` route with CSV injection sanitization |
| Performance Cycle Management | ✅ | Admin can open/close Goal Setting & Q1–Q4 windows |
| Immutable Audit Trail | ✅ | JSON diff logs for every manager edit, timestamped |
| Role-Based Access Control | ✅ | JWT claims validated on every server action + page load |
| Security Headers | ✅ | HSTS, X-Frame-Options, X-XSS-Protection, nosniff |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Vercel Edge Network                   │
│                   (Mumbai, India - bom1)                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌───────────────┐    ┌──────────────────────────┐     │
│   │  Login / SSO  │    │  Next.js App Router      │     │
│   │  (Auth.js v5) │───▶│  Server Components       │     │
│   │  JWT Sessions │    │  Server Actions           │     │
│   └───────────────┘    └──────────┬───────────────┘     │
│                                   │                     │
│                          ┌────────▼────────┐            │
│                          │   Prisma ORM    │            │
│                          │  (Type-safe DA) │            │
│                          └────────┬────────┘            │
│                                   │                     │
└───────────────────────────────────┼─────────────────────┘
                                    │
                           ┌────────▼────────┐
                           │   Supabase      │
                           │   PostgreSQL    │
                           │  (Mumbai, India)│
                           └─────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|:---|:---|:---|
| **Framework** | Next.js 16 (App Router) | Server-rendered React with Server Actions |
| **Language** | TypeScript | End-to-end type safety |
| **Styling** | CSS Modules | Glassmorphism design system, zero external CSS deps |
| **Database** | PostgreSQL (Supabase) | Cloud-hosted relational DB with connection pooling |
| **ORM** | Prisma | Type-safe schema management, migrations, indexing |
| **Auth** | Auth.js v5 (NextAuth) | JWT sessions, Credentials + Azure AD SSO |
| **Charts** | Chart.js + react-chartjs-2 | Admin analytics visualizations |
| **Icons** | Lucide React | Lightweight SVG icon library |
| **Hosting** | Vercel | Serverless deployment, auto-scaling |

---

## 🔒 Security

- **Authentication**: JWT-based sessions via Auth.js v5 with bcrypt password hashing (cost factor 10)
- **Authorization**: Every Server Action and page route validates `session.user.role` before any data access
- **SQL Injection**: Prevented by Prisma's parameterized queries
- **XSS**: React's automatic JSX escaping
- **CSV Injection**: Export route sanitizes all cell values against formula injection (`=`, `+`, `-`, `@`)
- **Clickjacking**: `X-Frame-Options: DENY` header on all responses
- **HTTPS**: `Strict-Transport-Security` enforced with 1-year max-age
- **Input Validation**: Cycle status changes validated against an allowlist; weightage/goal-count constraints enforced server-side

---

## ⚙️ Running Locally

```bash
# 1. Clone the repository
git clone https://github.com/LakshayKapur06/goal-tracking-portal.git
cd goal-tracking-portal

# 2. Install dependencies
npm install

# 3. Configure environment variables
#    Create a .env file with your PostgreSQL connection string and Auth secret:
#    DATABASE_URL="postgresql://..."
#    DIRECT_URL="postgresql://..."
#    AUTH_SECRET="your-secret-key"

# 4. Push schema to database and seed with demo data
npx prisma db push
npx tsx prisma/seed.ts

# 5. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the portal.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── actions/          # Server Actions (goalActions, managerActions, checkinActions, adminActions)
│   ├── admin/            # Admin pages (analytics, audit, cycles)
│   ├── api/              # API routes (auth, CSV export)
│   ├── check-ins/        # Employee & Manager check-in views
│   ├── dashboard/        # Role-aware dashboard with stat cards
│   ├── goals/            # Goal creation & manager review
│   ├── login/            # Authentication page
│   ├── layout.tsx        # Root layout with SessionProvider
│   └── loading.tsx       # Global loading state (Suspense boundary)
├── components/           # Shared components (Navigation, SessionProvider)
├── lib/                  # Utilities (Prisma client, scoring algorithms)
└── auth.ts               # Auth.js configuration (JWT, providers, callbacks)
prisma/
├── schema.prisma         # Database schema (13 models, indexed)
└── seed.ts               # Demo data seeder
```

---

## 📄 License

Built for the AtomQuest Hackathon 2026. All rights reserved.
