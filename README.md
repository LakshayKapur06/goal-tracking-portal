<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/target.svg" alt="GoalTracker Logo" width="80" height="80">
  <h1>Goal Setting & Tracking Portal</h1>
  <p>A structured, digital platform that eliminates manual goal-tracking pain points, providing seamless alignment, visibility, and accountability across the entire organization.</p>
  
  [![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://goal-tracking-portal-jade.vercel.app)
</div>

<br />

## 🔗 Live Prototype
**Access the live deployment here:** [Goal Tracker Portal](https://goal-tracking-portal-jade.vercel.app)

### Demo Credentials
Log in using any of the following pre-configured profiles (Password for all: `password123`):
- 👨‍💼 **Admin:** `admin@company.com` (Access analytics, cycle management, and audit logs)
- 🧑‍🏫 **Manager:** `manager@company.com` (Review team goals and quarter check-ins)
- 👨‍💻 **Employee:** `employee@company.com` (Set objectives, weightages, and log progress)

*(Note: Microsoft Entra ID (Azure AD) SSO is also fully integrated and supported for enterprise environments).*

---

## 🚀 Key Features & Implementation

### 1. Goal Creation & Approval Workflow
- **Validation Constraints:** Total weightage must equal exactly 100%. Employees are capped at a maximum of 8 active goals.
- **Thrust Areas & UoM:** Goals align with standard enterprise Thrust Areas (Financial, Customer, Internal Process, Learning) and compute based on four distinct Units of Measurement (MIN, MAX, TIMELINE, ZERO).
- **Manager Locking:** Managers can review, inline-edit, return for rework, or approve (lock) the goals directly from their dashboard.

### 2. Quarterly Check-ins & Analytics
- **Continuous Tracking:** Employees input their achievements quarterly (Q1-Q4). 
- **Automated Scoring:** The system instantly calculates achievement scores mapped mathematically to the selected Unit of Measurement.
- **Admin Dashboard & Export:** Interactive analytics populated dynamically via Chart.js, visualizing organizational alignment. Features a single-click CSV Export for HR performance reviews.

### 3. Comprehensive Security & Audit Trail
- **Role-Based Access Control (RBAC):** NextAuth.js JWTs ensure strict boundary control. Employees cannot access manager reviews; managers cannot access admin configurations.
- **Immutable Audit Logging:** Every time a manager overrides a goal target or weightage, the database generates an immutable JSON audit trail capturing the entity, the actor, and the timestamp.

---

## 🛠️ Technology Stack

| Architecture Layer | Technology Used | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | `Next.js 14+` | React App Router for server-rendered UI and dynamic routing. |
| **Styling** | `Vanilla CSS Modules` | Custom, zero-dependency glassmorphism design system. |
| **Database** | `PostgreSQL (Supabase)` | Fully relational, cloud-hosted DB ensuring persistent multi-user testing. |
| **ORM** | `Prisma` | Type-safe schema management and data access. |
| **Authentication** | `NextAuth.js (v5)` | JWT Sessions with Credentials fallback and Azure SSO. |
| **Deployment** | `Vercel` | Edge-optimized global deployment. |

---

## ⚙️ Running Locally

If you wish to spin up the environment locally, ensure you have Node.js installed, then follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/LakshayKapur06/goal-tracking-portal.git
   cd goal-tracking-portal
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and securely populate your PostgreSQL connection strings.

4. **Push Schema and Seed Database:**
   ```bash
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```
   Navigate to `http://localhost:3000` to view the portal.
