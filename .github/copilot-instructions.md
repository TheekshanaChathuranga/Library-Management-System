## Purpose
Short, targeted instructions to help AI coding assistants be productive when working on this repository.

## Big picture
- Backend: Node + Express API in `backend/`. Entry point: `backend/server.js`. Uses MySQL via `mysql2/promise` pool in `backend/config/database.js`.
- Frontend: React app in `frontend/` (Create React App). Entry: `frontend/src/App.jsx`. API integration via `frontend/src/services/api.js` (axios instance).
- Database: schema, stored procedures and sample data live in `database/` (`schema.sql`, `procedures.sql`, `sample_data.sql`). Several controllers call stored procedures (e.g. `CALL SearchBooks(?)`, `CALL AddBook(...)`).

## Key integration points and conventions
- API base path: backend exposes routes under `/api/*` (see `server.js`). Frontend default expects API at `http://localhost:5000/api` or `process.env.REACT_APP_API_URL`.
- Auth: JWT tokens. Middleware functions `authenticate` and `authorize` are in `backend/middleware/auth.js`. Routes protect endpoints like in `backend/routes/bookRoutes.js` using `authenticate` and `authorize(['Admin','Librarian'])`.
- DB calls: controllers use `db.query(...)` and sometimes stored procedures. Stored-proc responses often come back as nested arrays (e.g. `result[0][0]`). Follow existing controller patterns when adding new DB interactions.
- Response shape: controllers respond consistently with { success, message, data, count } where applicable. Match this shape for new endpoints.
- Error handling: controllers catch errors, log them and return `{ success: false, message: '...' }`. The app has a global error handler in `server.js` that includes stack traces in development.

## Developer workflows (commands & env)
- Backend (Windows PowerShell):
  - cd backend; npm install
  - npm run dev  # nodemon for local development
  - npm start    # production / simple run
- Frontend:
  - cd frontend; npm install
  - npm start    # runs CRA dev server on :3000
  - Set `REACT_APP_API_URL` in `frontend/.env` if backend is not at the default
- Database setup:
  - Load `database/schema.sql` then `database/sample_data.sql` and `database/procedures.sql` into a MySQL instance used by the backend (DB connection from env vars). Controllers rely on stored procedures defined in `procedures.sql`.

Required env vars (backend):
- PORT, NODE_ENV, DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET

Frontend hints:
- The axios instance is in `frontend/src/services/api.js`. It reads a token from `localStorage` and attaches `Authorization: Bearer <token>`. On 401 it clears auth and redirects to `/login`.

Patterns & idioms to follow (concrete examples)
- Route protection: use `authenticate` then `authorize([...roles])` in route files (see `backend/routes/bookRoutes.js`).
- Stored-procedure usage: when controller calls a procedure expect nested result arrays:
  - Example: `const [books] = await db.query('CALL SearchBooks(?)', [q]);` then use `books[0]` for the rows returned.
- Partial updates: controllers use SQL `COALESCE(?, field)` to keep existing values when fields are omitted (see `updateBook`).

What to watch for / gotchas
- DB connection: the pool immediately tests a connection at import time and logs success/failure (`backend/config/database.js`). Ensure your MySQL server is accessible before running the backend.
- Stored procedures: many important operations live in SQL (e.g., AddBook). Editing or adding functionality may require updating `database/procedures.sql` and reloading DB objects.
- CORS: `server.js` is configured to allow `http://localhost:3000`. If the frontend is served elsewhere, update CORS origin.

If you change public API behavior
- Update both backend controllers and frontend `services/api.js` usage. Keep response shapes consistent.

Files to inspect first when debugging a feature
- `backend/server.js` — route wiring, middleware and error handler
- `backend/config/database.js` — DB pool and env vars
- `backend/middleware/auth.js` — authentication/authorization logic
- `backend/controllers/*.js` and `backend/routes/*.js` — controller patterns and response shapes
- `frontend/src/services/api.js` — how the frontend calls backend APIs and handles auth/401
- `database/*.sql` — schema, stored procedures, sample data

If anything is unclear or you need expanded patterns (testing conventions, CI, or env examples), ask and I will extend this file with concrete examples and commands.

---
Please review and tell me which sections need more detail or examples (for instance, sample .env content or a walkthrough for adding a new protected endpoint).
