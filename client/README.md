# IT Helpdesk — Client

React + TypeScript + Vite front end for the IT Helpdesk project. This stage
covers authentication and role-based routing. Ticket features come next.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5173. The app uses an in-browser mock API by default, so
no backend is needed to try the auth flow.

## Demo accounts

| Role     | Email                    | Password    |
| -------- | ------------------------ | ----------- |
| Employee | employee@helpdesk.local  | Password123! |
| Agent    | agent@helpdesk.local     | Password123! |
| Admin    | admin@helpdesk.local     | Password123! |

The login page shows one-click buttons for these while mock mode is enabled.

## What is implemented

- Login for all three roles, with a single form and role-based redirect
- Signup, which always creates an Employee (FR-1)
- JWT session stored in `localStorage`, restored on reload, cleared on logout
- Role-guarded routes: `/employee`, `/agent`, `/admin`
- Placeholder dashboards that show the signed-in user and planned features
- Mock API with the same function signatures the real API will use

## Connecting the backend

Environment variables live in `.env.development` and `.env.example`.

1. Start the Spring Boot API at `http://localhost:8080`.
2. Set `VITE_USE_MOCK=false`.
3. Keep `VITE_API_URL=/api` to use the dev proxy, or set an absolute URL. The
   proxy forwards `/api/*` and strips the `/api` prefix, so the frontend call
   `/api/auth/login` reaches `/auth/login` on the backend. If your server
   already exposes routes under `/api`, remove the `rewrite` line in
   `vite.config.ts`.
4. The auth layer expects:

   ```json
   POST /auth/login    -> { "token": "...", "user": { "id": 1, "name": "...", "email": "...", "role": "employee" } }
   POST /auth/register -> { "user": { ... } }
   ```

   Token/role naming differences are normalized in `src/api/auth.ts`, including
   `accessToken`/`jwt` and roles such as `EMPLOYEE` or `ROLE_EMPLOYEE`. Update
   `normalizeAuthResponse` there if the backend shape differs.

5. Backend errors are read from `message`/`error` and `fieldErrors`/`errors`.
   Errors that match a form field are shown inline; others appear as a banner.

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
  api/          request client, auth service, mock API, shared types
  auth/         session storage, auth context, route guards, role helpers
  components/   UI primitives, auth layout, app shell
  lib/          validation schemas, error mapping, small utilities
  pages/        login, signup, role dashboards, 404
```
