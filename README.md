# LB Computer Institute — Backend API

Node.js + Express + MongoDB (Mongoose) backend for the LB Computer
Institute website: student records, certificates, ID cards, and
enquiries, with JWT-based admin login.

## Setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env — set MONGO_URI, JWT_SECRET, CLIENT_ORIGIN
npm run dev
```

Server runs at `http://localhost:5000` by default.
Health check: `GET /api/health`

## Create the first admin account

The first administrator is created automatically from `backend/.env`
when the server starts and no administrator exists in the local admin store.
There is no public admin-setup route. After that, log in normally:

```
POST /api/auth/login
{ "username": "admin", "password": "..." }
```

Response includes a `token` — send it on every protected request as:

```
Authorization: Bearer <token>
```

## Routes

| Method | Route                                        | Auth   | Purpose |
|--------|-----------------------------------------------|--------|---------|
| POST   | /api/auth/login                               | Public | Admin login |
| POST   | /api/students                                 | Admin  | Add student |
| GET    | /api/students?search=&course=&status=         | Admin  | List/search students |
| GET    | /api/students/:studentId                      | Admin  | Get one student |
| PUT    | /api/students/:studentId                      | Admin  | Update student |
| DELETE | /api/students/:studentId                      | Admin  | Delete student |
| GET    | /api/students/verify/id-card/:idCardNumber    | Public | ID card verification |
| POST   | /api/certificates                             | Admin  | Issue certificate |
| GET    | /api/certificates?search=&status=             | Admin  | List/search certificates |
| PUT    | /api/certificates/:certificateNumber          | Admin  | Update certificate |
| DELETE | /api/certificates/:certificateNumber          | Admin  | Delete certificate |
| GET    | /api/certificates/verify/:certificateNumber   | Public | Certificate verification |
| POST   | /api/enquiries                                | Public | Submit enquiry form |
| GET    | /api/enquiries?search=&status=                | Admin  | List/search enquiries |
| PUT    | /api/enquiries/:id                            | Admin  | Update enquiry status |
| DELETE | /api/enquiries/:id                            | Admin  | Delete enquiry |

## Connecting the frontend (replacing localStorage)

Right now the frontend (`admin/add-student.html`, `manage-students.html`,
`upload-certificate.html`, `enquiry.html`, the verification pages, etc.)
uses `localStorage` as a stand-in database, clearly marked in each file
with a comment like:

```js
/* TEMPORARY FRONTEND STORAGE */
```

To connect the real backend, replace those `localStorage.getItem` /
`setItem` calls with `fetch()` calls to the routes above, for example:

```js
// Before (localStorage):
const students = JSON.parse(localStorage.getItem("lbStudents")) || [];

// After (backend):
const res = await fetch("http://localhost:5000/api/students", {
  headers: { Authorization: "Bearer " + adminToken }
});
const students = await res.json();
```

Do this file by file — `add-student.html`/`edit-student.html` (POST/PUT
`/api/students`), `manage-students.html` (GET/DELETE `/api/students`),
`upload-certificate.html`/`manage-certificates.html`
(`/api/certificates`), `enquiry.html`/`enquiries.html`
(`/api/enquiries`), and both verification pages (the public `verify`
routes). `admin-login.html` should POST to `/api/auth/login` and store
the returned token (e.g. in `sessionStorage`) instead of showing the
placeholder message.

## File uploads (photos, certificates, ID cards)

`backend/uploads/` has three folders ready for `multer`:
`student-photos/`, `certificates/`, `id-cards/`. Add a multer
middleware to the relevant POST/PUT routes when you're ready to store
real files instead of base64 strings in the database.


### Administrator management
The public "Create Admin Account" link has been removed from the admin login page.
Only an authenticated administrator can add another administrator from **Admin Panel → Settings → Add Administrator**.
The protected API endpoint is `POST /api/auth/admins` and requires `Authorization: Bearer <admin-token>`.

For the easiest local setup, start the backend and open `http://localhost:5000/` so the website and API use the same server.

### Windows quick start
From the project root, double-click **START-BACKEND.bat**. Then open **http://localhost:5000/** in Chrome. Keep the server window open.

The backend uses MongoDB. Make sure MongoDB is running and the `MONGO_URI` in `.env` points to the correct database. Do not open the production site directly with `file://` when testing admin authentication; use the localhost URL served by the backend.


## Admin access

There is no public admin-signup page and there is no public first-admin API route. The first administrator is created automatically on backend startup using `ADMIN_INITIAL_USERNAME` and `ADMIN_INITIAL_PASSWORD` when the database has no administrator. After that, only an authenticated administrator can add another administrator from **Admin → Settings → Add Administrator**.

For the packaged project, `backend/.env` is configured with the initial admin account requested by the project owner. Keep that file private.

## Easiest Windows startup

Double-click `START-LB-INSTITUTE.bat`. It starts the backend and opens the website on port 5000. MongoDB must be running, or replace `MONGO_URI` with a MongoDB Atlas connection string.
