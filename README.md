# SupportSync

A full-stack helpdesk ticketing system for customers and support administrators.

## Overview

SupportSync is a role-based support portal that lets customers create tickets, attach files, track status, and continue conversations with support staff. Administrators can review incoming tickets, update status, manage priority, and monitor operational metrics from a focused dashboard.

The project is built as a practical full-stack application with a FastAPI backend and a React/Vite frontend. It demonstrates authentication, protected routes, ticket CRUD, comments, attachment handling, and a recruiter-friendly UI suitable for demos and internship evaluation.

## Assignment Requirements Covered

- Create Tickets
- List All Tickets
- Search Functionality
- Filter by Status
- View Ticket Details
- Update Ticket Status
- Add Notes / Comments

Additional Enhancements:
- Authentication
- Role-Based Access Control
- Dashboard Analytics
- Ticket Editing
- Ticket Deletion
- File Attachments

## Features

### Customer Features

- Create support tickets with subject, description, priority, and optional attachment.
- View personal ticket history with search and status filtering.
- Open ticket details, edit ticket information, delete tickets, and add comments.
- Track ticket priority, current status, and conversation history.

### Admin Features

- Dashboard overview with total, open, in-progress, closed, and high-priority ticket counts.
- Recent tickets table and all tickets management view.
- Search and filter tickets by status and priority.
- Update ticket status inline or from the ticket detail view.
- Review customer details and ticket conversation threads.

## Tech Stack

### Backend

FastAPI, SQLAlchemy, SQLite, JWT, Python-Jose, Passlib, Uvicorn, Python-Multipart

### Frontend

React, Vite, Tailwind CSS, Axios, React Router, SweetAlert2

## Project Structure

```text
SupportSync/
|-- backend/
|   |-- auth.py
|   |-- database.py
|   |-- main.py
|   |-- models.py
|   |-- schemas.py
|   |-- seed_admin.py
|   |-- requirements.txt
|   |-- routes/
|   |   |-- auth_routes.py
|   |   |-- dashboard_routes.py
|   |   `-- ticket_routes.py
|   `-- uploads/
|-- frontend/
|   |-- index.html
|   |-- package.json
|   |-- vite.config.js
|   `-- src/
|       |-- App.jsx
|       |-- index.css
|       |-- main.jsx
|       |-- pages/
|       |   |-- Login.jsx
|       |   |-- Signup.jsx
|       |   |-- CustomerDashboard.jsx
|       |   |-- AdminDashboard.jsx
|       |   `-- TicketDetails.jsx
|       `-- services/
|           `-- api.js
|-- .env.example
|-- .gitignore
`-- README.md
```

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

The API runs at:

```text
http://127.0.0.1:8000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app runs at:

```text
http://localhost:5173
```

### Running Locally

Start the backend first, then start the frontend. Use the seeded admin account for admin testing, or create a customer account from the signup page.

## Environment Variables

| Variable | Description | Default | Required |
| --- | --- | --- | --- |
| SECRET_KEY | Secret used to sign JWT tokens. | your-secret-key-here | Yes |
| ALGORITHM | JWT signing algorithm. | HS256 | Yes |
| ACCESS_TOKEN_EXPIRE_MINUTES | Access token lifetime in minutes. | 30 | Yes |
| DATABASE_URL | SQLAlchemy database connection URL. | sqlite:///./supportsync.db | Yes |
| ALLOWED_ORIGINS | Browser origins allowed by CORS. | http://localhost:5173 | Yes |
| UPLOAD_DIR | Directory for uploaded files. | uploads | Yes |
| MAX_FILE_SIZE_MB | Maximum upload size in megabytes. | 10 | Yes |
| ADMIN_EMAIL | Seed admin email for local setup. | admin@example.com | No |
| ADMIN_PASSWORD | Seed admin password for local setup. | change-this-admin-password | No |
| VITE_API_BASE_URL | Frontend API base URL. | https://supportsync-production.up.railway.app | Yes |

## API Overview

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| POST | /auth/signup | Register a customer account. | No |
| POST | /auth/login | Authenticate and return a JWT token. | No |
| POST | /auth/token | OAuth-compatible login for Swagger. | No |
| GET | /dashboard/stats | Return admin dashboard ticket counts. | Yes, admin |
| GET | /tickets/ | List tickets with optional search and status filters. | Yes |
| POST | /tickets/ | Create a ticket with optional attachment. | Yes |
| GET | /tickets/{ticket_id} | Fetch ticket details. | Yes |
| PUT | /tickets/{ticket_id} | Update ticket subject, description, and priority. | Yes |
| DELETE | /tickets/{ticket_id} | Delete a ticket and related comments. | Yes |
| PUT | /tickets/{ticket_id}/status | Update ticket status. | Yes, admin |
| POST | /tickets/{ticket_id}/comments | Add a comment to a ticket. | Yes |
| GET | /tickets/{ticket_id}/comments | List comments for a ticket. | Yes |
| GET | /uploads/... | Serve uploaded attachment files. | No |

## Deployment

### Backend (Render / Railway)

1. Create a new Python web service.
2. Set the backend directory as the service root if supported.
3. Install dependencies from `backend/requirements.txt`.
4. Use this start command:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

5. Configure production environment variables and use a strong `SECRET_KEY`.

### Frontend (Vercel / Netlify)

1. Create a new frontend project from the repository.
2. Set the frontend directory as the project root.
3. Use this build command:

```bash
npm run build
```

4. Use this publish directory:

```text
dist
```

### Environment Variables for Production

- Set `SECRET_KEY` to a long random value.
- Set `ALLOWED_ORIGINS` to the deployed frontend URL.
- Set `VITE_API_BASE_URL` to the deployed backend URL.
- Use a persistent database service for production instead of local SQLite when possible.

## Security Notes

- Never commit `.env` files or real production secrets.
- Rotate the default development admin password before any public deployment.
- Use HTTPS for production frontend and backend deployments.
- Restrict CORS to trusted origins only.

## Known Limitations

- The current backend uses SQLite by default, which is best suited for local development.
- Upload storage is local, so production deployments should use persistent storage.
- The frontend API base URL is currently hardcoded in the Axios service and should be wired to `VITE_API_BASE_URL` before production.

## Future Improvements

- Add email notifications for ticket status changes.
- Add pagination for large ticket lists.
- Add richer admin customer management views.
- Move configuration values fully into environment variables.
- Add automated frontend and backend tests.

## License

MIT
=======
Support ticket management system featuring role-based access, dashboard analytics, and attachment support.
>>>>>>> 6d62d9394d935fc17fd1726b36904e0d5201f931
