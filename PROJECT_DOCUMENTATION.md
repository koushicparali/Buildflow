# BuildFlow: Full-Stack Project Documentation

This document outlines the architecture, features, and technical decisions I made while building **BuildFlow**, transforming it from a static HTML template into a modern, full-stack application using React (Vite) and Django REST Framework.

---

## Phase 1: Frontend Modernization (React & Vite)
I started with a traditional structure—a single, massive `index.html` file, a `style.css` file, and a monolithic `script.js` file. To make the application scalable and maintainable, I migrated the entire frontend to a Single Page Application (SPA) using React and Vite.

### 1. Component Extraction
I broke down the monolithic HTML into reusable, modular React components located in `src/components/`:
- **`Navbar.jsx`**: Handles navigation, the mobile hamburger menu toggle, and the Dark/Light theme state.
- **`Hero.jsx`**: Contains the animated background slider and the primary "Get Started" call-to-action.
- **`StatsBox.jsx`**: A reusable component I built to handle dynamic number-counting animations when scrolled into view.
- **`QuoteModal.jsx`**: A pop-up modal for quote requests that I wired to trigger via custom window events.
- **`Footer.jsx`**: Global footer with quick links and SVG social icons.

### 2. Client-Side Routing
I integrated `react-router-dom` to handle routing. This gives the app lightning-fast page transitions without full browser reloads. I created dedicated page components in `src/pages/`:
- Core Pages: `Home.jsx`, `Features.jsx`, `About.jsx`, `FAQ.jsx`, `Contact.jsx`
- Auth Pages: `Login.jsx`, `Signup.jsx`
- Legal Pages: `Privacy.jsx`, `Terms.jsx`

### 3. JavaScript to React Hooks Translation
One of the biggest challenges was migrating direct DOM manipulation from the old `script.js` into standard React state management. Here is how I handled it:
- **Scroll Reveal Animations**: I implemented a global `IntersectionObserver` inside `App.jsx` using `useEffect` so that elements seamlessly fade in as the user scrolls down.
- **Hero Slider**: I converted the slider logic to use `useState` and `useEffect`, automatically rotating the background image every 5 seconds.
- **Theme Toggle**: I bound the Dark/Light mode toggle to `localStorage` and React state in the Navbar so the user's preference persists across reloads.
- **FAQ Accordion**: I converted this to state-based indexing so that clicking a question expands the answer and collapses the others.

Once the React application was fully styled (by migrating my CSS into `src/index.css`), I permanently deleted the legacy HTML and JS files to keep the repository clean.

---

## Phase 2: Role-Based Architecture
I designed the application's user model around a strict **4-tier hierarchy** tailored specifically for construction site management:

1. **Administrator**: Full system access, user management, and global reporting.
2. **Project Manager (PM)**: Project creation, task assignment, and progress tracking.
3. **Engineer**: Viewing assigned tasks and submitting daily work progress updates.
4. **Contractor**: Viewing assigned projects and checking upcoming deadlines.

### Implementation:
- **Signup Flow**: I updated the `Signup.jsx` form so users must register strictly under one of these four roles.
- **Dedicated Dashboards**: I built four entirely separate React dashboard pages (`DashboardAdmin.jsx`, `DashboardProjectManager.jsx`, `DashboardEngineer.jsx`, `DashboardContractor.jsx`). Each dashboard displays distinct UI cards and activity logs relevant to their specific permissions.
- **Navigation**: To keep the Navbar clean, I grouped these dashboards into a "Dashboards" hover dropdown.

---

## Phase 3: Backend Setup (Django REST Framework)
To power the React frontend and make the application truly dynamic, I built a robust, secure backend using Django.

### 1. Project Initialization & Dependencies
- I created the Django `backend` project and the core `api` application.
- I installed `djangorestframework` for building the REST API.
- I configured `django-cors-headers` in `settings.py` (`CORS_ALLOW_ALL_ORIGINS = True`) to allow my React frontend to securely request data.
- I integrated `djangorestframework-simplejwt` to handle secure user logins and session management via JSON Web Tokens (JWT).

### 2. Database Tables & Schema (`api/models.py`)
I designed and successfully migrated the relational database schema into our SQLite database using Django's ORM. We currently have three core tables created:
- **`users` Table**: Extended from Django's default user to include my strict `role` field (Admin, PM, Engineer, Contractor).
- **`projects` Table**: Tracks construction projects. Key fields include `title`, `status`, `deadline`, and `created_by` (Foreign Key to User).
- **`tasks` Table**: Tracks individual work assignments. Key fields include `title`, `progress` (0-100 integer), `status`, `project` (Foreign Key), and `assigned_to` (Foreign Key to User).

*(Note: These database tables are fully created and active in the backend!)*

### 3. REST API Endpoints
I built the API layer to expose these database tables to React:
- **Serializers (`api/serializers.py`)**: I wrote serializers to convert my complex database tables into clean JSON data.
- **ViewSets (`api/views.py`)**: I used ViewSets to handle the core CRUD (Create, Read, Update, Delete) logic and enforced `IsAuthenticated` permissions so endpoints are secure.
- **URL Routers (`api/urls.py`)**: I used Django's DefaultRouter to automatically map the ViewSets to predictable endpoints:
  - `/api/users/`
  - `/api/projects/`
  - `/api/tasks/`
- **Authentication**: I exposed `/api/token/` and `/api/token/refresh/` for React to request login tokens.

### 4. Admin & Verification
- I registered all tables in `api/admin.py` to leverage Django's powerful built-in admin panel for raw data management.
- Finally, I ran automated Django system checks and executed my database migrations (`makemigrations` and `migrate`) to generate the tables with 0 errors.

---

## Phase 4: Future Roadmap to Completion
While the core architecture is established and the database tables exist, there are several key phases required to bring BuildFlow to full production readiness. Here is my roadmap to complete the project:

### 1. Frontend-Backend Integration & UI Tables
The most immediate next step is to connect the React frontend to the Django backend.
- **Frontend Data Tables**: While the database tables exist, the React dashboards currently use mock summary lists. I need to build dynamic UI Data Grids/Tables (e.g., using `ag-Grid` or standard HTML `<table>` components) inside the Dashboards to display the actual Projects and Tasks fetched from the API.
- **Authentication**: Implement Axios or Fetch API calls in `Login.jsx` and `Signup.jsx` to hit the `/api/token/` endpoints, securely storing the JWT in `localStorage` or HttpOnly cookies.
- **Role-Based Route Protection**: Implement React context and higher-order components (HOCs) to secure routes, ensuring that an Engineer cannot access the Admin dashboard.

### 2. Form Handling & Data Mutations
- **Project & Task Creation**: Build forms in the Admin and PM dashboards to execute `POST` requests to the Django API, creating new projects and assigning tasks to workers.
- **Status Updates**: Build UI toggles in the Engineer and Contractor dashboards to send `PATCH` requests to update task progress (0-100%) and mark milestones as completed.

### 3. Real-Time Features & Notifications
- **WebSockets**: Implement Django Channels to push real-time notifications to users (e.g., notifying an Engineer the moment a PM assigns them a new task).
- **In-App Messaging**: Expand the internal query system to allow for real-time chat or commenting on specific tasks.

### 4. Deployment & DevOps
- **Backend Deployment**: Containerize the Django application using Docker and deploy it to a platform like Render, Heroku, or AWS EC2, switching from SQLite to a robust PostgreSQL database.
- **Frontend Deployment**: Build the Vite production bundle and deploy the React frontend to Vercel or Netlify.
- **CI/CD Pipeline**: Set up GitHub Actions to automatically lint, test, and deploy code changes when pushed to the main branch.
