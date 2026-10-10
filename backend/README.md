# Leave Management System — Laravel API Backend

REST API backend for a leave management web application, built with Laravel 10 and Laravel Sanctum. Consumed by the React frontend.

> **Status:** individual internship project, validated by my supervisor. Not deployed in production by the organization.

---

## Features

- JWT-less Bearer token authentication via Laravel Sanctum
- Role-based access control: `admin` and `employee` roles
- Leave request lifecycle: submit → pending → approved / rejected
- Automatic working-day calculation (weekends excluded)
- Leave balance tracking per employee per year
- PDF leave certificate generation (Blade template + DomPDF)
- Notification system with unread count
- Admin dashboard statistics endpoint

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Laravel 10 |
| Auth | Laravel Sanctum (Bearer token) |
| Database | MySQL |
| PDF generation | barryvdh/laravel-dompdf |
| Language | PHP 8.2 |

---

## Project Structure

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── AuthController.php          # Login, logout, /me
│   │   ├── LeaveRequestController.php  # Submit, list, calculate days, PDF
│   │   ├── AdminController.php         # Admin stats, approve/reject
│   │   └── NotificationController.php  # List, mark as read
│   └── Middleware/
│       └── RoleMiddleware.php          # Admin/employee route guard
├── Models/
│   ├── Employee.php
│   ├── LeaveRequest.php
│   ├── LeaveBalance.php
│   └── Notification.php
database/
├── migrations/                         # All table definitions
├── seeders/
│   └── EmployeeSeeder.php              # Demo accounts (fictitious data)
resources/views/certificates/
│   └── leave_certificate.blade.php     # PDF template
routes/
│   └── api.php                         # All API routes
```

---

## Getting Started

### Prerequisites

- PHP ≥ 8.2
- Composer
- MySQL
- The React frontend running on `http://localhost:3000`

### Installation

```bash
git clone https://github.com/nouhaila2030/leave-management-laravel-api.git
cd leave-management-laravel-api
composer install
cp .env.example .env
php artisan key:generate
```

### Database setup

Create a MySQL database named `leave_management`, then update `.env`:

```
DB_DATABASE=leave_management
DB_USERNAME=root
DB_PASSWORD=
```

Run migrations and seeders:

```bash
php artisan migrate --seed
```

Demo accounts created by the seeder:

| Role | Email | Password |
|---|---|---|
| Admin | admin@leave-management.local | password123 |
| Employee | employee@leave-management.local | password111 |

### Run the development server

```bash
php artisan serve
```

API available at `http://localhost:8000/api`.

---

## API Routes

```
POST   /api/login
POST   /api/logout
GET    /api/me
GET    /api/my-requests
POST   /api/leave-requests
POST   /api/calculate-days
GET    /api/leave-requests/{id}/certificate
GET    /api/notifications
PUT    /api/notifications/{id}/read

GET    /api/admin/dashboard/stats
GET    /api/admin/leave-requests
PUT    /api/admin/leave-requests/{id}/status
GET    /api/admin/approved-requests
GET    /api/admin/leave-requests/{id}/certificate
```

All routes except `/api/login` require `Authorization: Bearer <token>`.

---

## Related Repository

Frontend (React): [leave-management-laravel-react](https://github.com/nouhaila2030/leave-management-laravel-react)

---

## License

Academic project developed during a summer internship (July 2025). All data used in development is fictitious.
