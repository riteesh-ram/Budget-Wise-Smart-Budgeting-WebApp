# BudgetWise – Smart Budgeting Web App

A full-stack personal finance application that helps users track income, expenses, and categories with visual charts and filtered transaction history. Built as a portfolio project.

**Live app:** [budgetwise-smart-budgeting.vercel.app](https://budgetwise-smart-budgeting.vercel.app)

---

## What It Does

- Register and log in securely with JWT-based authentication
- Add, view, and delete income and expense records organized by custom categories
- Dashboard with balance overview, totals, and recent transaction feed
- Charts (pie and line) for spending and income patterns
- Filter transactions by keyword, date range, category, and sort order
- Download income/expense reports as Excel files or email them directly
- Manage a profile with a custom avatar (uploaded to Cloudinary)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Spring Boot 3.5 (Java 21), Spring Security, JPA |
| Authentication | JWT (HS256), BCrypt |
| Database | PostgreSQL (Neon) |
| Image Storage | Cloudinary |
| Frontend Hosting | Vercel |
| Backend Hosting | Render (Docker) |
| Uptime Monitoring | UptimeRobot |

---

## Architecture Overview

```
User (Browser)
    │
    ▼
React SPA (Vercel CDN)
    │  Axios + JWT header
    ▼
Spring Boot REST API (Render)
    ├── JWT filter validates every request
    ├── Business logic (income, expense, category, dashboard)
    ├── Apache POI for Excel report generation
    └── SMTP (Gmail) for emailing reports
         │
         ▼
    PostgreSQL (Neon)    Cloudinary (profile images)
```

- The frontend is a single-page application deployed as a static site on Vercel.
- The backend is containerized with Docker and deployed on Render's free tier, kept awake 24/7 by UptimeRobot pinging the `/health` endpoint every 5 minutes.
- The database is hosted on Neon's serverless PostgreSQL — data persists indefinitely on the free tier.
- All API routes except `/register`, `/login`, `/health`, and `/status` require a valid JWT.

---

## Running Locally

**Backend**
```bash
cd SmartBudgetingBackend
mvn spring-boot:run
```
Requires a local MySQL instance and `application.properties` configured with your DB credentials and JWT secret.

**Frontend**
```bash
cd SmartBudgetingWebApp
npm install
npm run dev
```
Set `VITE_BACKEND_BASE_URL=http://localhost:8080/api/v1.0` in a `.env` file.

---

## Environment Variables

**Backend (Render)**

| Variable | Purpose |
|---|---|
| `DB_URL` | PostgreSQL JDBC connection string |
| `DB_USERNAME` / `DB_PASSWORD` | Database credentials |
| `JWT_SECRET` | Secret key for signing tokens |
| `MAIL_USERNAME` / `MAIL_PASSWORD` | Gmail SMTP credentials for report emails |
| `FRONTEND_URL` | Allowed CORS origin |
| `APP_URL` | Backend's own public URL |
| `SPRING_PROFILES_ACTIVE` | Set to `prod` to activate PostgreSQL config |

**Frontend (Vercel)**

| Variable | Purpose |
|---|---|
| `VITE_BACKEND_BASE_URL` | Full backend API base URL including context path |
