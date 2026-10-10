# Leave Management System (Laravel API + React)

Full-stack web application that digitalizes leave management for an HR department in a public administration context. Built during an internship (July 2025) to replace paper forms, Excel files and emails with a centralized, trackable workflow.

> **Status:** individual internship project, validated by my supervisor. Not deployed in production by the organization.

## Repository structure

```
.
├── src/, public/     # React frontend
├── backend/          # Laravel REST API
├── docs/             # Documentation and screenshots
└── package.json
```

## Features

### Employee portal
- Personalized welcome page and profile overview (personal details, department, position, leave balance)
- Submit a leave request (annual, sick, maternity, emergency)
- Automatic calculation of working days (weekends excluded)
- Real-time balance check before submission, blocked if the balance is insufficient
- Request tracking with status (pending / approved / rejected)
- Download of the approved leave certificate as a PDF
- Notification center with unread badge and mark-as-read action

### Admin portal
- Dashboard with key statistics: total, approved and pending requests, utilization rate
- Employee directory with department and leave balance
- Feed of the 5 most recent requests
- Approve or reject a request in one click, with automatic update of the employee's balance
- Dedicated view of approved requests and certificate download

### General
- Bilingual interface (French / Arabic, RTL supported)
- Role-based access: `employee` / `admin`
- Automatic redirect to `/login` on 401 / expired token

## Architecture

```
React (frontend)  <-- HTTP / JSON, Bearer token -->  Laravel REST API (MVC, Eloquent)  <-->  MySQL
```

### Backend (`backend/`)
- **Framework:** Laravel (PHP), MVC architecture, Eloquent ORM
- **Controllers** (`app/Http/Controllers/Api`): authentication, leave requests, leave balances, leave history, notifications, profile, admin and dashboard statistics
- **Models:** `Employee`, `LeaveRequest`, `LeaveBalance`, `Notification`
- **Middleware:** admin role check, CORS, cookie encryption, CSRF verification
- **Authentication:** Laravel Sanctum Bearer tokens

### Database (MySQL)

| Table | Purpose |
|---|---|
| `employees` | Employee information and role |
| `leave_requests` | Requests with dates, type, status and admin comment |
| `leave_types` | Leave categories (annual, sick, maternity, exceptional...) |
| `leave_balances` | Remaining leave days per employee |
| `notifications` | Notifications for employees and admins |

Laravel internal tables (migrations, sessions, tokens, jobs, cache) complete the schema.

### Frontend (`src/`)
React 19, React Router 7, Axios, Tailwind CSS utility classes. Main components: landing page, login, employee dashboard, admin dashboard, leave request form, notifications, approved requests, auth context.

## Getting started

**Prerequisites:** PHP 8.1+, Composer, Node.js 18+, MySQL.

### 1. Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
# Edit .env: set DB_DATABASE, DB_USERNAME, DB_PASSWORD
php artisan migrate --seed
php artisan serve        # http://localhost:8000
```

Demo accounts created by the seeder:

| Role | Email | Password |
|---|---|---|
| Admin | admin@leave-management.local | password123 |
| Employee | employee@leave-management.local | password111 |

### 2. Frontend (in another terminal, from the repository root)

```bash
npm install
npm start                # http://localhost:3000
```

The API base URL is set to `http://localhost:8000/api` in `src/utils/api.js`.

## API endpoints used

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/login` | Authenticate and retrieve Bearer token |
| POST | `/api/logout` | Invalidate token |
| GET | `/api/me` | Current user profile |
| GET | `/api/my-requests` | Employee's requests and leave balance |
| POST | `/api/leave-requests` | Submit a leave request |
| POST | `/api/calculate-days` | Working days for a date range |
| GET | `/api/notifications` | Notifications and unread count |
| PUT | `/api/notifications/:id/read` | Mark a notification as read |
| GET | `/api/leave-requests/:id/certificate` | Leave certificate (PDF) |
| GET | `/api/admin/dashboard/stats` | Admin statistics |
| GET | `/api/admin/leave-requests` | All requests (admin) |
| PUT | `/api/admin/leave-requests/:id/status` | Approve or reject a request |
| GET | `/api/admin/approved-requests` | Approved requests (admin) |
| GET | `/api/admin/leave-requests/:id/certificate` | Certificate (admin) |

## Authentication flow

1. The user submits credentials on `/login`.
2. Laravel Sanctum returns a Bearer token (opaque token, not a JWT).
3. The token and user object are stored in `localStorage`.
4. An Axios interceptor adds `Authorization: Bearer <token>` to every request.
5. On a 401 response, the interceptor clears the storage and redirects to `/login`.

## Security notes

- Access control is enforced on the API side (Laravel middleware). The role-based routing in the React app only improves the user experience and is not a security boundary.
- The token is stored in `localStorage` for simplicity. In production, an `httpOnly` cookie would reduce the impact of XSS attacks.
- Secrets are kept out of the repository: `.env` is ignored and `.env.example` is provided.
- All data used in development is fictitious.

## Known limitations and future improvements

- Not deployed in production
- Automated tests (PHPUnit / Jest) to add
- Public holidays handling in the working-days calculation
- Email notifications in addition to in-app notifications
- Docker setup for easier deployment

## My contribution

Individual project: requirements gathering with my supervisor, database modeling (conceptual model and MySQL schema), UI mockups in Figma, Laravel API, React interface, role management, notifications, and manual testing.

## License

Academic project developed during a summer internship (July 2025).

## Author

**Nouhaila El Hamal** — Engineering student in Information Systems Security  
[LinkedIn](https://www.linkedin.com/in/nouhaila-el-hamal-972805293/) · [GitHub](https://github.com/nouhaila2030)
