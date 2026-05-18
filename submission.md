# Goal Setting & Tracking Portal - Submission Document

**Working Link:** [Insert your Vercel Link Here - e.g., https://goal-tracking-portal.vercel.app]

**Source Code Repository:** [Insert your GitHub Link Here - e.g., https://github.com/LakshayKapur06/goal-tracking-portal]

---

## Architecture Diagram

*(You can copy and paste the code block below into [Mermaid Live Editor](https://mermaid.live/) to generate an image file, or if your submission format supports Markdown, it will automatically render into a diagram!)*

```mermaid
graph TD
    %% User Interfaces
    subgraph "Frontend Client (React/Next.js UI)"
        A[Login / SSO]
        B[Employee Dashboard]
        C[Manager Dashboard]
        D[Admin Dashboard]
    end

    %% API & Server Logic
    subgraph "Backend Server (Next.js App Router)"
        E[Auth.js Middleware & JWT Sessions]
        F[Server Actions / API Routes]
        G[Prisma ORM (Data Access Layer)]
    end

    %% Database & External Services
    subgraph "Infrastructure Layer"
        H[(Supabase PostgreSQL)]
        I[Azure AD / Microsoft Entra ID]
        J[Vercel Edge Network]
    end

    %% Data Flow Connections
    A -->|Credentials / OAuth| E
    B -->|Form Submissions| F
    C -->|Review Edits| F
    D -->|Analytics Queries| F

    E -.->|Token Validation| I
    F -->|CRUD Operations| G
    G <-->|Query / Mutate| H
    
    %% Deployment Context
    J -.->|Hosts & Scales| A
    J -.->|Hosts & Scales| B
    J -.->|Hosts & Scales| C
    J -.->|Hosts & Scales| D
```

## System Overview & Tech Stack
- **Framework:** Next.js (App Router, Server Actions)
- **Database:** PostgreSQL (Hosted on Supabase)
- **ORM:** Prisma
- **Authentication:** Auth.js (NextAuth) with JWT and Microsoft Entra ID (Azure AD) SSO Support
- **Hosting/Deployment:** Vercel

## Key Security Features
- Complete isolation of database credentials via server-side environment variables.
- Server-side route validation guarding Manager/Admin boundaries.
- No client-side exposure of authentication secrets (all JWT parsing handles server-side).
