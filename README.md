# 🌊 LogStream Ops

**Real-time High-Throughput Log Ingestion & AI-Powered Analysis Infrastructure.**

LogStream Ops is a modern, full-stack observability platform designed for real-time log ingestion, telemetry visualization, and AI-driven error diagnostics. Built with a focus on performance, scalability, and developer experience.

## 🏗️ Architectural Blueprint

### **Frontend Core**
- **Framework:** [Next.js 15+](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Real-time:** Socket.io-client for live dashboard updates.
- **State Management:** Redux Toolkit & RTK Query.
- **Deployment:** Vercel.

### **Backend Services**
- **Engine:** Node.js (Express.js) with TypeScript.
- **Ingestion:** High-throughput API endpoints for log streaming.
- **Real-time:** Socket.io for bidirectional communication with the dashboard.
- **ORM:** [Prisma](https://www.prisma.io/) (PostgreSQL).
- **Deployment:** Render.

### **Cloud & Persistence**
- **Database:** High-Availability PostgreSQL Cluster.
- **Caching:** Redis instances for rapid log retrieval and rate limiting.
- **AI Engine:** Hugging Face Inference for automated log analysis.

---

## 🚀 CI/CD & Deployment

This project uses a fully automated "Build-Once, Deploy-Anywhere" pipeline via GitHub Actions.

### **Pipelines**
- **Frontend CI/CD:** Automatically validates types/linting and deploys Preview builds (PRs) or Production builds (Main) to Vercel.
- **Backend CI/CD:** Orchestrates ephemeral PostgreSQL testing environments, executes Prisma migrations, runs Vitest suites, and triggers Render deployment hooks.

### **Required GitHub Secrets**
To enable the pipelines, configure the following in `Settings -> Secrets and variables -> Actions`:

| Secret Name | Description |
| :--- | :--- |
| `VERCEL_TOKEN` | Vercel Scoped API Token |
| `VERCEL_ORG_ID` | Vercel Team/Account ID |
| `VERCEL_PROJECT_ID` | Vercel Project ID |
| `DATABASE_URL` | Production PostgreSQL Connection String |
| `RENDER_DEPLOY_HOOK_URL` | Render Service Deploy Hook URL |

---

## 🛠️ Local Development

### **Prerequisites**
- Node.js 20+
- Docker (optional, for local DB)
- npm (Workspace support)

### **Getting Started**

1. **Clone and Install:**
   ```bash
   git clone <repo-url>
   cd logstream-ops
   npm install
   ```

2. **Environment Setup:**
   Create `.env` files in `packages/backend` and `packages/frontend` based on the `.env.example` files provided.

3. **Run Dev Environment:**
   ```bash
   # Start all services (Frontend & Backend)
   npm run dev
   ```

4. **Database Migrations:**
   ```bash
   cd packages/backend
   npx prisma migrate dev
   ```

---

## 🧪 Quality Control
- **Linting:** `npm run lint`
- **Type Checking:** `npm run type-check`
- **Testing:** `npm run test`

---

## 📄 License
LogStream Ops is [ISC Licensed](./LICENSE).
