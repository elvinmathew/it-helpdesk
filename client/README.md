# IT Helpdesk — Client

React + TypeScript + Vite front end for the IT Helpdesk project. It covers the
authentication flow, role dashboards, ticket raising, the agent queue (kanban
and table), and the admin overview. The backend is not required to try it: an
in-browser mock API is enabled by default.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5173. The app uses the mock API by default, so no backend
is needed.

## Demo accounts

| Role     | Email                    | Password    |
| -------- | ------------------------ | ----------- |
| Employee | employee@helpdesk.local  | Password123! |
| Agent    | agent@helpdesk.local     | Password123! |
| Admin    | admin@helpdesk.local     | Password123! |

The login page shows one-click buttons for these while mock mode is enabled.
Signing up always creates an Employee (FR-1).

## What is implemented

- Login, signup, JWT-style session in `localStorage`, logout, role guards.
- Employee dashboard: open/resolved counts, my tickets with status and priority
  filters, search, raise-new-ticket form, ticket detail with comments.
- Agent dashboard: unassigned/overdue counts, filters (status, priority,
  category, assignee, title search), kanban board with drag-and-drop status
  changes, table view with quick actions (assign to me, set status, set
  priority), ticket detail with status history and comments.
- Admin dashboard: total/open/overdue/active-agent counts, status chart, and
  per-agent workload.
- Admin insights: open/resolved/overdue/unassigned counts, status and agent
  charts, plus category and priority breakdowns.
- Admin settings: manage user roles and active state, add or retire statuses and
  categories, and edit the overdue threshold. All changes persist through the
  mock API.
- Every status change is written to the ticket history and shown on the detail
  page. The overdue rule defaults to 24 hours and can be changed in settings.
- shadcn/ui components on a light slate + indigo theme; the auth screens were
  migrated to the same primitives.

## Mock data

The mock API seeds 20 tickets, the four default statuses, and the ten default
categories on first run. Timestamps are relative to the current time, so the
two overdue examples stay overdue.

| Key                             | Contents                        |
| ------------------------------- | ------------------------------- |
| `it-helpdesk.mock.users`        | demo users and signups          |
| `it-helpdesk.mock.tickets`      | tickets                         |
| `it-helpdesk.mock.comments`     | ticket comments                 |
| `it-helpdesk.mock.history`      | status-change history           |
| `it-helpdesk.mock.statuses`     | statuses                        |
| `it-helpdesk.mock.categories`   | categories                      |
| `it-helpdesk.mock.settings`     | overdue-hours rule              |
| `it-helpdesk.mock.data-version` | seed version marker             |

To reset the demo data, clear `localStorage` for the site (DevTools →
Application → Local storage → Clear) or remove the keys above. The auth session
lives under `it-helpdesk.token` and `it-helpdesk.user`.

Mock passwords are plain text in `localStorage` because the data never leaves
the browser. Do not copy that pattern into the backend.

## Connecting the backend

Environment variables live in `.env.development` and `.env.example`.

1. Start the Spring Boot API at `http://localhost:8080`.
2. Set `VITE_USE_MOCK=false`.
3. Keep `VITE_API_URL=/api` to use the dev proxy, or set an absolute URL. The
   proxy forwards `/api/*` and strips the `/api` prefix, so `/api/auth/login`
   reaches `/auth/login` on the backend. If your server already exposes routes
   under `/api`, remove the `rewrite` line in `vite.config.ts`.

### Auth responses

```json
POST /auth/login    -> { "token": "...", "user": { "id": "1", "name": "...", "email": "...", "role": "employee", "active": true } }
POST /auth/register -> { "user": { ... } }
```

The client uses exactly this shape. If the backend differs (for example
`accessToken` or `data` envelopes), change `src/api/auth.ts` rather than adding
tolerance across the whole API layer.

### Ticket endpoints

| Method | Endpoint                        | Response                          |
| ------ | ------------------------------- | --------------------------------- |
| GET    | `/tickets`                      | `Ticket[]`                        |
| POST   | `/tickets`                      | `Ticket`                          |
| GET    | `/tickets/{id}`                 | `TicketDetail` (comments, history)|
| PATCH  | `/tickets/{id}/status`          | `204` (callers reload)            |
| PATCH  | `/tickets/{id}/assign`          | `204` (callers reload)            |
| PATCH  | `/tickets/{id}/priority`        | `204` (callers reload)            |
| POST   | `/tickets/{id}/comments`        | `Comment`                         |
| GET    | `/statuses`                     | `Status[]`                        |
| GET    | `/categories`                   | `Category[]`                      |
| GET    | `/dashboard/employee`           | `EmployeeDashboard`               |
| GET    | `/dashboard/agent`              | `AgentDashboard`                  |
| GET    | `/dashboard/admin`              | `AdminDashboard`                  |

### Admin endpoints

| Method | Endpoint                    | Response            |
| ------ | --------------------------- | ------------------- |
| GET    | `/admin/users`              | `User[]`            |
| PATCH  | `/admin/users/{id}/role`    | `User`              |
| PATCH  | `/admin/users/{id}/active`  | `User`              |
| POST   | `/admin/statuses`           | `Status`            |
| PATCH  | `/admin/statuses/{id}`      | `Status`            |
| POST   | `/admin/categories`         | `Category`          |
| PATCH  | `/admin/categories/{id}`    | `Category`          |
| GET    | `/admin/settings`           | `HelpdeskSettings`  |
| PUT    | `/admin/settings`           | `HelpdeskSettings`  |

The project spec lists status and assign actions but no priority endpoint. The
client assumes `PATCH /tickets/{id}/priority`; change `ticketsApi.setPriority`
in `src/api/tickets.ts` if the backend uses a different route.

List filters are sent as `statusId`, `priority`, `categoryId`, `assignee`
(`unassigned` or a user id), and `search`. Errors are read from `message` and
`fieldErrors`. There is no response-shape guessing: each service maps one
endpoint to one TypeScript type.

## Scripts

```bash
npm run dev      # dev server with mock API
npm run build    # type-check and production build
npm run lint     # eslint
npm run preview  # preview the production build
```

A production build has mock mode off unless `VITE_USE_MOCK=true` is set, so
`npm run preview` expects the real API to be available.

## Structure

```
src/
  api/          request client, one service per resource, types, mock API
  auth/         session storage, auth context, route guards, role helpers
  components/   shadcn ui primitives, app shell, dashboard and ticket pieces
  lib/          validation, formatting, error mapping, async data hook, cn
  pages/        auth, role dashboards, admin insights/settings, tickets, 404
```
