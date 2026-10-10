# Leave Management System — React Frontend

A web application for managing employee leave requests in a public administration context. Built with React, it communicates with a Laravel REST API backend.

> **Status:** individual internship project, validated by my supervisor. Not deployed in production by the organization.

---

## Features

### Employee portal
- Personalized welcome page with greeting based on time of day
- Profile overview: personal details, department, position, leave balance
- Submit a new leave request (annual, sick, maternity, emergency)
- Automatic calculation of working days (weekends excluded)
- Real-time balance check before submission — blocks if balance is insufficient
- Track all submitted requests with their status (pending / approved / rejected)
- Download the approved leave certificate as a PDF
- Notification center with unread count badge and mark-as-read action

### Admin portal
- Dashboard with key statistics: total requests, approved, pending, utilization rate
- Employee directory with CIN, phone, email, department, and leave balance
- Feed of the 5 most recent requests
- Manage all leave requests: approve or reject with one click
- Download the leave certificate PDF for any approved request
- Dedicated view for all approved requests

### General
- Bilingual interface (French / Arabic, RTL supported)
- Bearer token authentication (Laravel Sanctum) stored in `localStorage`
- Role-based routing: `/employee-dashboard` and `/admin-dashboard`
- Automatic redirect to `/login` on 401 / expired token
- Responsive design with Tailwind CSS utility classes

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI framework | React 19 |
| Routing | React Router DOM 7 |
| HTTP client | Axios 1 + native `fetch` |
| Styling | Tailwind CSS (utility classes) |
| Auth | Bearer token (Laravel Sanctum) stored in `localStorage` |
| Backend (separate repo) | Laravel 10 + Sanctum |

---

## Project Structure

```
src/
├── components/
│   ├── LandingPage.js          # Bilingual landing page (FR/AR)
│   ├── Login.js                # Login form
│   ├── EmployeeDashboard.js    # Employee home, request form, history, notifications
│   ├── AdminDashboard.js       # Admin stats, request management, employee list
│   ├── EmployeeNavigation.js   # Employee top navigation bar
│   ├── AdminNavigation.js      # Admin top navigation bar
│   ├── LeaveRequestForm.js     # Leave submission form with live day calculation
│   ├── LeaveHistory.js         # Leave history component
│   ├── Notifications.js        # Notifications component
│   ├── ApprovedRequests.js     # Approved requests list
│   ├── AdminRequests.js        # Admin requests list
│   └── Layout.js               # Layout wrapper
├── contexts/
│   └── AuthContext.js          # Auth context (login, logout, token management)
├── utils/
│   ├── api.js                  # Axios instance with auth interceptors
│   ├── dateUtils.js            # Date helper functions
│   └── leaveBalance.js         # Leave balance utilities
└── App.js                      # Route definitions
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- The Laravel API backend running on `http://localhost:8000`

### Installation

```bash
git clone https://github.com/nouhaila2030/leave-management-laravel-react.git
cd leave-management-laravel-react
npm install
```

### Configuration

The API base URL is set to `http://localhost:8000/api` in `src/utils/api.js`.
Change it to match your backend URL if needed.

### Run in development mode

```bash
npm start
```

Opens at [http://localhost:3000](http://localhost:3000).

### Build for production

```bash
npm run build
```

Output goes to the `build/` folder.

---

## API Endpoints Used

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/login` | Authenticate and retrieve Bearer token |
| POST | `/api/logout` | Invalidate token |
| GET | `/api/me` | Get current user profile |
| GET | `/api/my-requests` | Get employee's requests + leave balance |
| POST | `/api/leave-requests` | Submit a new leave request |
| POST | `/api/calculate-days` | Calculate working days for a date range |
| GET | `/api/notifications` | Get notifications + unread count |
| PUT | `/api/notifications/:id/read` | Mark a notification as read |
| GET | `/api/leave-requests/:id/certificate` | Download leave certificate (PDF) |
| GET | `/api/admin/dashboard/stats` | Admin dashboard statistics |
| GET | `/api/admin/leave-requests` | List all leave requests (admin) |
| PUT | `/api/admin/leave-requests/:id/status` | Approve or reject a request |
| GET | `/api/admin/approved-requests` | List approved requests (admin) |
| GET | `/api/admin/leave-requests/:id/certificate` | Download certificate (admin) |

---

## Authentication Flow

1. User submits credentials on `/login`.
2. Laravel Sanctum returns a Bearer token (opaque token, not JWT).
3. Token and user object are stored in `localStorage`.
4. Every request adds `Authorization: Bearer <token>` via the Axios interceptor in `src/utils/api.js`.
5. On 401 response, the interceptor clears storage and redirects to `/login`.
6. Role check on each dashboard mount: employees redirected if they access the admin route and vice versa.

---

## Leave Balance Logic

- Each employee has an annual allocation of working days.
- When a request is submitted, working days are counted server-side (weekends excluded).
- The frontend calls `/api/calculate-days` in real time as the user picks dates, and disables the submit button if the balance is insufficient.
- Remaining days are shown on the employee home tab and updated after each approved request.

---

## Related Repository

Backend API (Laravel): _to be published_

---

## License

Academic project developed during a summer internship (July 2025). All data used in development is fictitious.
