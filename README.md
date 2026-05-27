# Full Calendar React

Laravel + Inertia + React remake of `../full-calendar-sample/`.

The application keeps the sample app's behavior intact:

- public home page with a weekly FullCalendar view
- seeded appointments, clients, and employees
- Breeze auth flows
- profile management
- paginated users list

## Stack

- Laravel 13
- Inertia.js
- React 18
- FullCalendar React
- Vite
- Tailwind CSS 4
- SQLite by default

## Setup

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed
```

## Development

Run the full local loop:

```bash
composer run dev
```

Frontend only:

```bash
npm run dev
```

## Verification

Run tests:

```bash
composer test
```

Build production assets:

```bash
npm run build
```

## Demo Data

The calendar depends on seeded data. If the calendar is empty or you want to refresh the demo week:

```bash
php artisan migrate:fresh --seed
```

Appointments are seeded relative to the current week start so the calendar stays useful as a demo.

## App Mapping

Compared with `../full-calendar-sample/`:

- Blade pages were replaced with Inertia React pages
- the old Blade home page calendar is now `resources/js/Pages/Home.jsx`
- Laravel still owns routes, auth, validation, redirects, and database access
- FullCalendar is installed from npm instead of loaded from a CDN
