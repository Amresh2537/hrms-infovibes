# Abha HRMS

Abha is a Next.js App Router HRMS starter with MongoDB, JWT cookie auth, role-based dashboards, attendance, leave management, and monthly reporting.

## Stack

- Next.js 16 with App Router and `src` layout
- React 19
- Tailwind CSS 4
- MongoDB with Mongoose
- JWT auth with HTTP-only cookies

## Environment Variables

Create a `.env.local` file in the project root.

```bash
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<database>
MONGODB_DB=abha_hrms
JWT_SECRET=replace-with-a-long-random-secret
```

`MONGODB_DB` is optional but recommended. If your URI does not include a database name, the app will use `MONGODB_DB` (or fallback to `abha_hrms`).

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Included API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/employees`
- `POST /api/employees`
- `PUT /api/employees/:id`
- `DELETE /api/employees/:id`
- `POST /api/attendance/check-in`
- `POST /api/attendance/check-out`
- `POST /api/leave/apply`
- `PUT /api/leave/approve`
- `GET /api/reports/monthly`

## Notes

- The first HR admin can be created through `POST /api/auth/register` by setting `role` to `HR`.
- GPS attendance uses the Haversine formula and compares employee coordinates against the assigned work radius.
- Middleware protects dashboard and API routes based on the JWT session role.
