# University Module Planner

A full-stack web application for university students to manage their modules, track assignments, and visualise deadlines on an interactive calendar.

---

## Features

- **User Authentication** — Register and log in with JWT-based sessions
- **Module Management** — Create, edit, and delete university modules with custom colour tags and semester labels
- **Assignment Tracking** — Add assignments with deadlines, descriptions, and statuses; filter by module or status
- **Dashboard** — At-a-glance stats with Chart.js doughnut and bar charts showing completion progress and per-module workload
- **Calendar View** — FullCalendar month view with assignments colour-coded by module; click events to see full details
- **Status Toggle** — Quickly flip assignments between `Pending` and `Submitted`
- **Cascade Delete** — Deleting a module automatically removes all its associated assignments

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Charts | Chart.js 4, react-chartjs-2 |
| Calendar | FullCalendar 6 |
| Backend | Node.js, Express 4 |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Data Store | File-based JSON (no external database required) |

---

## Project Structure

```
university_module_planner/
├── backend/
│   ├── server.js           # Express app entry point
│   ├── package.json
│   ├── config/
│   │   └── db.js           # JSON file store (CRUD helper class)
│   ├── data/               # Auto-created; stores users.json, modules.json, assignments.json
│   ├── middleware/
│   │   └── auth.js         # JWT verification middleware
│   └── routes/
│       ├── auth.js         # /api/auth — register, login, me
│       ├── modules.js      # /api/modules — CRUD
│       └── assignments.js  # /api/assignments — CRUD + filters
└── frontend/
    ├── next.config.mjs
    ├── package.json
    └── src/
        ├── app/
        │   ├── page.js           # Dashboard
        │   ├── modules/page.js   # Modules list & management
        │   ├── assignments/page.js
        │   ├── calendar/page.js
        │   ├── login/page.js
        │   └── register/page.js
        ├── components/
        │   └── Sidebar.js
        ├── context/
        │   └── AuthContext.js    # Global auth state
        └── lib/
            └── api.js            # Typed API helpers (modulesApi, assignmentsApi)
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### 1. Clone the repository

```bash
git clone https://github.com/GovinduDandeniya/university_module_planner.git
cd university_module_planner
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
JWT_SECRET=your_super_secret_key_here
```

Start the backend server:

```bash
npm run dev
```

The API will be available at `http://localhost:5000`.

### 3. Set up the frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## API Reference

All protected routes require an `Authorization: Bearer <token>` header.

### Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Log in and receive a JWT |
| GET | `/api/auth/me` | Protected | Get current user info |

### Modules

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/modules` | Protected | Get all modules for the authenticated user |
| POST | `/api/modules` | Protected | Create a new module |
| PUT | `/api/modules/:id` | Protected | Update a module |
| DELETE | `/api/modules/:id` | Protected | Delete a module and all its assignments |

**Module fields:** `moduleName`, `moduleCode`, `semester`, `colorTag`

### Assignments

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/assignments` | Protected | Get all assignments (supports `?module=<id>` and `?status=<status>` filters) |
| POST | `/api/assignments` | Protected | Create a new assignment |
| PUT | `/api/assignments/:id` | Protected | Update an assignment |
| DELETE | `/api/assignments/:id` | Protected | Delete an assignment |

**Assignment fields:** `title`, `description`, `deadline` (ISO date), `status` (`Pending` \| `Submitted`), `moduleId`

---

## Data Storage

The backend uses a lightweight file-based JSON store (`backend/data/`) instead of a database. The `data/` directory and the three JSON files (`users.json`, `modules.json`, `assignments.json`) are created automatically on first run. This keeps setup dependency-free — no database installation or configuration needed.

> **Note:** This store is suitable for development and personal use. For production deployments, replacing `config/db.js` with a database adapter (e.g. MongoDB, PostgreSQL) is recommended.

---

## Screenshots

| Page | Description |
|---|---|
| **Dashboard** | Summary cards, doughnut chart (completion rate), bar chart (assignments per module), upcoming deadlines list |
| **Modules** | Module cards with colour-coded tags, inline edit/delete |
| **Assignments** | Filterable table with status toggle, add/edit/delete |
| **Calendar** | Month grid with colour-coded deadline events; click for details |

---

## License

This project is open source and available under the [MIT License](LICENSE).
