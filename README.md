# Backend Server (server.js)

Express + MongoDB API for the AI Enabled Academic and Career Planning System. This server powers authentication, role-based dashboards, student and college profiles, quiz analysis, applications, and admin management.

> This README documents the JavaScript runtime in `backend/server.js` (started with `node server.js` or the root script `npm run start:backend`). The backend folder also contains a separate TypeScript implementation under `src/`, but the project root scripts use `server.js`.

## Features

- Health checks and basic diagnostics
- JWT authentication with role-based access control (student, college, admin)
- Automatic default Head Admin account creation
- Student profile CRUD + profile picture upload
- College profile CRUD + campus gallery upload/caption/delete
- Public and registered college search and details
- Career quiz (questions, submit, history, results, profile sync)
- Application management (student submit, college review/update)
- Admin: approvals, exports, analytics, bulk actions, cascading deletions
- Static serving for uploaded assets from `/uploads`

## Requirements

- Node.js 18+ (LTS recommended)
- MongoDB 6+ (local or hosted)
- PowerShell (Windows) or any shell for commands

## Quick start

1) Install dependencies

```powershell
# from the backend folder
cd backend
npm install
```

2) Configure environment

Copy `.env.example` to `.env` and adjust values.

```powershell
Copy-Item .env.example .env
```

Required variables (see `backend/.env.example`):

- MONGODB_URI=mongodb://localhost:27017/college_finder
- JWT_SECRET=your-secret-key
- PORT=5000
- CORS_ORIGIN=http://localhost:5173

3) Start the server

```powershell
# Option A: from the repo root
npm run start:backend

# Option B: from the backend folder
node server.js
```

You should see output like:

```
MongoDB Connected: localhost
Server running on port 5000
Default admin credentials: admin@college-finder.com / admin123
```

4) Health check

```powershell
Invoke-RestMethod -Uri http://localhost:5000/api/health -Method GET | ConvertTo-Json -Depth 4
```

## Default Head Admin

On first run, the server creates a Head Admin if none exists:

- Email: admin@college-finder.com
- Password: admin123

Change this immediately in production. Only the Head Admin can approve/reject admin registrations and create new admin users.

## Authentication

- Login returns a JWT. Include it in requests with `Authorization: Bearer <token>`.
- Login requires an `expectedRole` matching the user’s role.
- Protected routes additionally enforce role checks.

Example login:

```powershell
$body = @{ email = "student@example.com"; password = "secret"; expectedRole = "student" } | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:5000/api/auth/login -Method POST -ContentType 'application/json' -Body $body
```

## File uploads

- Student profile picture: `multipart/form-data` field name: `profilePicture` (max 5 MB)
- College campus gallery: `multipart/form-data` field name: `galleryImages` (array, max 10 files, 10 MB each)
- Uploaded files are served from `/uploads` (e.g., `/uploads/profile-pictures/<filename>`)

## Key API endpoints (summary)

Public
- GET `/api/health` — server status
- GET `/api/colleges` — static college search with filters
- GET `/api/colleges/search` — registered college search with filters/pagination
- GET `/api/colleges/:id` — registered college details

Auth & user
- POST `/api/auth/register` — register as student/college/admin
- POST `/api/auth/login` — login with `expectedRole`
- GET `/api/user/profile` — current user details (requires token)

Student profile
- GET `/api/student/profile` — fetch student profile
- PUT `/api/student/profile` — update student profile
- POST `/api/student/profile-picture` — upload profile picture (form-data: `profilePicture`)
- DELETE `/api/student/profile-picture` — delete profile picture

College profile & gallery
- GET `/api/college/profile` — fetch college profile
- PUT `/api/college/profile` — update college profile
- GET `/api/college/campus-gallery` — list campus gallery
- POST `/api/college/campus-gallery` — upload images (form-data: `galleryImages`)
- PUT `/api/college/campus-gallery/:imageId` — update caption
- DELETE `/api/college/campus-gallery/:imageId` — delete image

Quiz
- GET `/api/quiz/questions` — active questions
- POST `/api/quiz/submit` — submit responses, get recommendations
- GET `/api/quiz/history` — recent attempts
- GET `/api/quiz/result/:quizId` — detailed result
- POST `/api/quiz/update-profile/:quizId` — sync top streams to student profile

Applications
- POST `/api/applications/submit` — student submits application
- GET `/api/applications/my-applications` — student’s applications
- GET `/api/applications/college-applications` — applications for logged-in college
- PUT `/api/applications/:applicationId/status` — college updates status

Admin — approvals & stats
- GET `/api/admin/pending-registrations` — list pending users
- POST `/api/admin/approve-registration/:id` — approve
- POST `/api/admin/reject-registration/:id` — reject
- GET `/api/admin/dashboard/stats` — global stats
- GET `/api/admin/export/users` — export users (CSV/JSON)
- GET `/api/admin/export/stats` — export summary

Admin — users/colleges/applications
- GET `/api/admin/users` — list all users (sanitized)
- GET `/api/admin/users/detailed` — paginated, filters
- PUT `/api/admin/users/:userId` — update user
- PUT `/api/admin/users/:userId/change-password` — admin sets password
- PUT `/api/admin/users/:userId/toggle-access` — enable/disable account
- DELETE `/api/admin/users/:userId` — cascading deletion with cleanup
- POST `/api/admin/users/bulk-action` — activate/deactivate/delete in bulk
- GET `/api/admin/colleges/detailed` — paginated list
- PUT `/api/admin/colleges/:collegeId` — update college
- DELETE `/api/admin/colleges/:collegeId` — cascade delete college
- GET `/api/admin/applications` — list applications
- PUT `/api/admin/applications/:applicationId/status` — update application status
- GET `/api/admin/system/stats` — system overview (activity, recents)
- GET `/api/admin/analytics/overview` — aggregated analytics

Admin — special
- POST `/api/admin/create-admin` — Head Admin creates a new admin
- POST `/api/admin/create-college-profiles` — generate basic profiles for approved colleges without profiles

Notes
- Some admin endpoints also check `req.user.isHeadAdmin` for elevated actions.
- A temporary diagnostics route exists: GET `/api/users/count` (remove for production).

## Seeding data (optional)

Useful scripts are included to quickly demo features:

```powershell
# from the backend folder
node seedDatabase.js           # Populate sample data
node seedColleges.js           # Insert static colleges
node seedQuizQuestions.js      # Insert quiz questions
node createTestUser.js         # Create a test user
```

Ensure MongoDB is running and `.env` is configured before running seeds.

## Error handling & limits

- JSON/body size limits: 10 MB
- Upload limits: 5 MB (profile picture), 10 MB per file (campus gallery)
- Validation errors return 400 with details
- Auth failures return 401/403; not found returns 404; unexpected errors return 500

## Directory notes

- `uploads/` — created on demand; served at `/uploads`
  - `uploads/profile-pictures/`
  - `uploads/campus-gallery/`
- `models/` — Mongoose schemas: User, StudentProfile, College, CollegeProfile, Application, Quiz
- `utils/QuizAnalyzer.js` — scoring and recommendations
- `config/database.js` — MongoDB connection using `MONGODB_URI`

## Security checklist

- Change the default Head Admin credentials immediately
- Use a strong `JWT_SECRET` and rotate it periodically
- Restrict CORS (`CORS_ORIGIN`) appropriately for production
- Remove debug endpoints (e.g., `/api/users/count`) before deploying
- Store uploads safely; consider antivirus/scanning and CDN for production

## Troubleshooting

- Connection refused / timeouts: verify `MONGODB_URI` and that MongoDB is running
- 401/403 errors: ensure you send `Authorization: Bearer <token>` and correct role
- 413 Payload Too Large: check request body or file sizes vs. configured limits
- Uploads not visible: confirm the URL path begins with `/uploads/...`

## License

ISC (see `package.json`)
