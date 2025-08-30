# Bobobox Frontend (React + Vite)

Frontend application for the Capsul Management demo. Built with React and Vite.

## Overview
This UI connects to the backend API (default: http://127.0.0.1:8000) to list, add, update and delete capsul/cabin units. It includes filtering, inline editing, status management, and pagination.

## Quick start (development)
1. Install dependencies:
   npm install
2. Run dev server:
   npm run dev
3. Open in browser:
   http://localhost:5173 (or the port printed by Vite)

## Backend API (default)
- GET  /api/units            - list units (supports ?status=)
- POST /api/units            - create unit (payload: { name, id_type, status })
- GET  /api/units/{id}       - get unit by id
- PUT  /api/units/{id}       - update unit (payload: { name, id_type, status })
- DELETE /api/units/{id}     - delete unit

The frontend expects the backend to be available at http://127.0.0.1:8000 by default. Change endpoints in the code if your backend runs elsewhere.

## Development Authentication (bypass)
- Note: for local development and demo purposes the app uses a simple authentication bypass.
- Development credentials:
  - Username: admin
  - Password: admin

Warning: These credentials are for local testing only. Do NOT use this bypass in staging or production. Remove or replace the bypass with proper authentication (OAuth/JWT/session-based) before deploying.

## Security recommendations
- Replace the dev bypass with a secure auth mechanism.
- Store secrets in environment variables (do not commit .env with credentials).
- Use HTTPS in production.
- Apply rate limiting and proper input validation on the backend.

## Tests & linting
- Run tests (if any): npm test
- Lint: npm run lint

## Notes
- See backend README and code under `be/` for DB, models and seeding instructions.
- For issues or further setup questions, inspect `be/.env` and `/be/utils/connection/connection_mysql.py` to ensure DB connectivity.
