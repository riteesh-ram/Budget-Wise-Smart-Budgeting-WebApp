# Budget Wise – Smart Budgeting Web App

## Executive Summary
- Tackles personal finance opacity by letting users centralize income, expenses, and categories with clear charts and recent-activity feeds.
- React SPA (Vercel-ready) talks to a stateless Spring Boot API (Render-ready) secured by JWT and BCrypt, enforcing strict CORS and sessionless auth.
- Data, media, and alerts flow through MySQL/TiDB, Cloudinary uploads, and SMTP emails for activation and scheduled reminders.

## High-Level Architecture
- Flow: User (React, Vercel) → Axios client with JWT interceptor → Secure API (Spring Boot, Render) → Persistence (MySQL/TiDB via JPA) → Cloudinary (profile images) → SMTP (activation + scheduled digests).
- Stateless auth: JWT verification in `JwtRequestFilter` before `UsernamePasswordAuthenticationFilter`; session policy is STATELESS in [SmartBudgetingBackend/src/main/java/in/riteeshram/smartbudgeting/config/SecurityConfig.java](SmartBudgetingBackend/src/main/java/in/riteeshram/smartbudgeting/config/SecurityConfig.java).
- CORS allowlist (Vercel + localhost variants) and exposed `Authorization` header via `CorsConfigurationSource` in the same config.

## Backend (Spring Boot)
- Entry point: [SmartBudgetingBackend/src/main/java/in/riteeshram/smartbudgeting/SmartBudgetingApplication.java](SmartBudgetingBackend/src/main/java/in/riteeshram/smartbudgeting/SmartBudgetingApplication.java) enables scheduling for nightly reminders.
- Security
	- Config: [config/SecurityConfig.java](SmartBudgetingBackend/src/main/java/in/riteeshram/smartbudgeting/config/SecurityConfig.java) sets public endpoints (`/status`, `/health`, `/register`, `/activate`, `/login`), JWT filter chain, BCrypt encoder, custom CORS.
	- JWT: [security/JwtRequestFilter.java](SmartBudgetingBackend/src/main/java/in/riteeshram/smartbudgeting/security/JwtRequestFilter.java) extracts/validates tokens and short-circuits with 401 on expiry or tampering; [util/JwtUtil.java](SmartBudgetingBackend/src/main/java/in/riteeshram/smartbudgeting/util/JwtUtil.java) issues and validates HS256 tokens from `jwt.secret`.
	- UserDetails: [service/AppUserDetailsService.java](SmartBudgetingBackend/src/main/java/in/riteeshram/smartbudgeting/service/AppUserDetailsService.java) loads users from profiles for authentication.
- Domain & Persistence
	- Entities: profiles, categories, incomes, expenses in [entity/](SmartBudgetingBackend/src/main/java/in/riteeshram/smartbudgeting/entity) with timestamps and FK links; profile has activation token and `isActive` flag.
	- DTOs: auth, profile, category, income, expense, filter, recent transaction in [dto/](SmartBudgetingBackend/src/main/java/in/riteeshram/smartbudgeting/dto).
	- Repositories: JPA + custom queries and bulk delete helpers in [repository/](SmartBudgetingBackend/src/main/java/in/riteeshram/smartbudgeting/repository).
- Business Services
	- Profiles & Auth: [service/ProfileService.java](SmartBudgetingBackend/src/main/java/in/riteeshram/smartbudgeting/service/ProfileService.java) handles registration (activation email), activation, login token minting, profile updates, and current-user lookup.
	- Categories: [service/CategoryService.java](SmartBudgetingBackend/src/main/java/in/riteeshram/smartbudgeting/service/CategoryService.java) validates ownership, prevents duplicates, and cascades deletes by removing linked incomes/expenses first.
	- Income/Expense: [service/IncomeService.java](SmartBudgetingBackend/src/main/java/in/riteeshram/smartbudgeting/service/IncomeService.java) and [service/ExpenseService.java](SmartBudgetingBackend/src/main/java/in/riteeshram/smartbudgeting/service/ExpenseService.java) add, list, filter (date/keyword/category/sort), compute totals, fetch recent 5, and enforce owner checks on deletes.
	- Dashboard aggregation: [service/DashboardService.java](SmartBudgetingBackend/src/main/java/in/riteeshram/smartbudgeting/service/DashboardService.java) merges recent income/expense into a unified transaction feed plus totals and balance.
	- Exports & email: [service/ExcelService.java](SmartBudgetingBackend/src/main/java/in/riteeshram/smartbudgeting/service/ExcelService.java) writes XLSX via Apache POI; [service/EmailService.java](SmartBudgetingBackend/src/main/java/in/riteeshram/smartbudgeting/service/EmailService.java) sends SMTP emails and attachments.
	- Scheduled notifications: [service/NotificationService.java](SmartBudgetingBackend/src/main/java/in/riteeshram/smartbudgeting/service/NotificationService.java) nightly reminders and daily expense summaries (cron IST) with links back to the frontend.
- Controllers (REST API)
	- Auth/Profile: register, activate, login, get/update profile in [controller/ProfileController.java](SmartBudgetingBackend/src/main/java/in/riteeshram/smartbudgeting/controller/ProfileController.java).
	- Health: `/status` and `/health` in [controller/HomeController.java](SmartBudgetingBackend/src/main/java/in/riteeshram/smartbudgeting/controller/HomeController.java).
	- Categories: CRUD + bulk delete and type filtering in [controller/CategoryController.java](SmartBudgetingBackend/src/main/java/in/riteeshram/smartbudgeting/controller/CategoryController.java).
	- Income/Expense: add/list/delete plus stubbed download/email fallbacks in [controller/IncomeController.java](SmartBudgetingBackend/src/main/java/in/riteeshram/smartbudgeting/controller/IncomeController.java) and [controller/ExpenseController.java](SmartBudgetingBackend/src/main/java/in/riteeshram/smartbudgeting/controller/ExpenseController.java).
	- Filters: keyword/date/category/sort filtering in [controller/FilterController.java](SmartBudgetingBackend/src/main/java/in/riteeshram/smartbudgeting/controller/FilterController.java).
	- Dashboard: aggregates in [controller/DashboardController.java](SmartBudgetingBackend/src/main/java/in/riteeshram/smartbudgeting/controller/DashboardController.java).
	- Excel/Email export: download and email reports in [controller/ExcelController.java](SmartBudgetingBackend/src/main/java/in/riteeshram/smartbudgeting/controller/ExcelController.java) and [controller/EmailController.java](SmartBudgetingBackend/src/main/java/in/riteeshram/smartbudgeting/controller/EmailController.java).
- Resilience
	- Global exceptions: maps validation errors and `DataIntegrityViolationException` to 409 to avoid 500s on duplicate emails; generic 500 fallback in [exception/GlobalExceptionHandler.java](SmartBudgetingBackend/src/main/java/in/riteeshram/smartbudgeting/exception/GlobalExceptionHandler.java).
- Configuration
	- Local dev properties: MySQL JDBC, Gmail SMTP, JWT secret/expiration, frontend URL, activation URL in [src/main/resources/application.properties](SmartBudgetingBackend/src/main/resources/application.properties).
	- Prod template: PostgreSQL placeholders in [src/main/resources/application-prod.properties](SmartBudgetingBackend/src/main/resources/application-prod.properties).

## Frontend (React + Vite)
- Entry & routing: [src/main.jsx](SmartBudgetingWebApp/src/main.jsx) wraps App with context; [src/App.jsx](SmartBudgetingWebApp/src/App.jsx) defines routes for landing, auth, dashboard, income, expense, category, filter, and profile with root redirect based on token presence.
- State & auth
	- Global user context: [src/context/AppContext.jsx](SmartBudgetingWebApp/src/context/AppContext.jsx) stores user and helpers; [src/hooks/useUser.jsx](SmartBudgetingWebApp/src/hooks/useUser.jsx) hydrates profile on mount and redirects to login on 401.
	- Axios client: [src/util/axiosConfig.jsx](SmartBudgetingWebApp/src/util/axiosConfig.jsx) attaches JWT unless hitting public endpoints, handles 401 by clearing token and redirecting, logs timeouts/500s.
	- API endpoints: [src/util/apiEndpoints.js](SmartBudgetingWebApp/src/util/apiEndpoints.js) centralizes backend paths and Cloudinary upload URL.
- Pages
	- Landing: hero + product showcase in [src/pages/LandingPage.jsx](SmartBudgetingWebApp/src/pages/LandingPage.jsx) with shared header.
	- Auth: [src/pages/Login.jsx](SmartBudgetingWebApp/src/pages/Login.jsx) and [src/pages/Signup.jsx](SmartBudgetingWebApp/src/pages/Signup.jsx) validate inputs, upload optional photo, call `/login` or `/register`, store JWT.
	- Dashboard: [src/pages/Home.jsx](SmartBudgetingWebApp/src/pages/Home.jsx) pulls `/dashboard`, shows totals, charts, and recent transactions.
	- Income/Expense: [src/pages/Income.jsx](SmartBudgetingWebApp/src/pages/Income.jsx) and [src/pages/Expense.jsx](SmartBudgetingWebApp/src/pages/Expense.jsx) list, group, filter by month/year, add via modals, delete with confirmation, download/email reports, and fetch categories by type.
	- Categories: bulk select/delete, add/edit with emoji picker in [src/pages/Category.jsx](SmartBudgetingWebApp/src/pages/Category.jsx).
	- Filters: combined keyword/date/category/sort filtering in [src/pages/Filter.jsx](SmartBudgetingWebApp/src/pages/Filter.jsx).
	- Profile: edit name/photo with Cloudinary upload in [src/pages/Profile.jsx](SmartBudgetingWebApp/src/pages/Profile.jsx).
- Reusable UI
	- Layout: [components/Menubar.jsx](SmartBudgetingWebApp/src/components/Menubar.jsx) + [components/Sidebar.jsx](SmartBudgetingWebApp/src/components/Sidebar.jsx) + [components/Dashboard.jsx](SmartBudgetingWebApp/src/components/Dashboard.jsx) gate content on user presence.
	- Cards/charts: info cards, recent transactions, grouped transaction lists, pie/line charts with custom legends/tooltips in [components](SmartBudgetingWebApp/src/components).
	- Forms: add income/expense/category with validation helpers and emoji picker; modals and delete confirmations reuse shared components.
- Utilities & assets
	- Number/date helpers: Indian numbering formatter and chart prep in [src/util/util.js](SmartBudgetingWebApp/src/util/util.js); email validator in [src/util/validation.js](SmartBudgetingWebApp/src/util/validation.js).
	- Uploads: Cloudinary unsigned upload helper in [src/util/uploadProfileImage.js](SmartBudgetingWebApp/src/util/uploadProfileImage.js).
	- Static assets and sidebar config in [src/assets/assets.js](SmartBudgetingWebApp/src/assets/assets.js).
- Styling: Tailwind utility classes via `@import "tailwindcss"` in [src/index.css](SmartBudgetingWebApp/src/index.css) plus shared class tokens (btns/cards/inputs).

## Key Behaviors
- Zero-trust auth: JWT is required for all non-public routes; tokens are validated per request, no server sessions.
- CORS-safe SPA: allowlisted origins and exposed `Authorization` header keep browser calls unblocked while rejecting unknown origins.
- Data integrity: category deletes cascade through income/expense cleanup to avoid FK errors; duplicate emails short-circuit with 409.
- Exports and alerts: XLSX download/email for income/expense; scheduled daily reminders and summaries via cron + SMTP.
- Resilient UX: axios interceptors handle expired tokens; filters and charts tolerate missing dates and guard against malformed data.

## Configuration & Environment
- Backend env: set `spring.datasource.*`, `jwt.secret`, `jwt.expiration`, `spring.mail.*`, `money.manager.frontend.url`, `app.activation.url`; optional `spring.profiles.active=prod` for prod DB.
- Frontend env: `VITE_BACKEND_BASE_URL` for API origin; optional `VITE_CLOUDINARY_UPLOAD_PRESET`.
- Default origins include `https://budgetwise-smart-budgeting.vercel.app` and localhost ports 5173/4173/3000.

## Running Locally
1) Backend: `./mvnw spring-boot:run` (or `mvn spring-boot:run`) from `SmartBudgetingBackend/`; ensure MySQL running and properties set.
2) Frontend: `cd SmartBudgetingWebApp && npm install && npm run dev` (or `npm run build && npm run preview`).
3) Access SPA at the Vite dev URL (defaults to http://localhost:5173); API served under `/api/v1.0` per `server.servlet.context-path`.

## Testing & Verification
- Smoke: call `/status` or `/health` for readiness; register/login; hit `/profile` to verify JWT; run dashboard and filter flows.
- Data: add/edit/delete categories, incomes, expenses; confirm cascaded deletes and grouped lists; download/email reports.
- Auth edges: try expired/invalid JWT to see 401 response; attempt duplicate email registration for 409 handling.