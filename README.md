# Smart Complaint Management System 🎓🤖

An AI-powered full-stack campus complaint management platform built with **Spring Boot 3.2 (Java 17)** and **React 18 (Vite)**. The system automatically classifies incoming student complaints by category, priority, and responsible department using AI (OpenAI / Gemini) with an automatic rule-based fallback, routing tickets through an administrative review and staff resolution lifecycle with real-time audit timelines.

---

## 🌟 Key Features

- **🤖 Automated AI Classification**: Classifies unstructured complaint descriptions into Category, Priority, and Department with plain-language reasoning. Includes a reliable rule-based fallback engine when no API keys are provided.
- **🛡️ Role-Based Access Control**:
  - **Students**: Self-registration, submit plain-text complaints, inspect AI categorization, view status timelines.
  - **Administrators**: Real-time KPI analytics, inspect/override AI suggestions, assign tasks to staff, reject invalid entries.
  - **Staff**: View dedicated assigned tasks, log progress remarks, resolve complaints with mandatory verification notes.
- **📜 Auditable Status History**: Every lifecycle change (`SUBMITTED` ➔ `ASSIGNED` ➔ `IN_PROGRESS` ➔ `RESOLVED` / `REJECTED`) is recorded in a dedicated audit log table.
- **🎨 Modern Responsive UI**: Built with pure CSS tokens, glassmorphic headers, responsive data tables, status badges, and animated cards.

---

## 📁 Repository Structure

```
smart-complaint/
├── backend/                  # Java 17 + Spring Boot 3.2.5 REST API
│   ├── src/main/java/com/smartcomplaint/
│   │   ├── config/           # Security, DataSeeder, CORS
│   │   ├── controller/       # Auth, Student, Admin, Staff APIs
│   │   ├── dto/              # Request / Response DTOs
│   │   ├── entity/           # User, Complaint, StatusHistory JPA entities
│   │   ├── exception/        # Centralized GlobalExceptionHandler
│   │   ├── repository/       # Spring Data JPA Repositories
│   │   ├── security/         # JWT Utils & Filters
│   │   └── service/          # ComplaintService, AuthService, AiClassificationService
│   ├── src/test/             # MockMvc integration tests & unit tests
│   └── pom.xml
├── frontend/                 # React 18 + Vite SPA
│   ├── src/
│   │   ├── components/       # Navbar, ProtectedRoute
│   │   ├── context/          # AuthContext (JWT & User state)
│   │   ├── pages/            # Home, Login, Register, Dashboards, Complaint Tracking
│   │   ├── services/         # Axios API client with token interceptors
│   │   ├── App.jsx           # Route configuration
│   │   └── index.css         # Modern design system
│   └── package.json
├── database/                 # MySQL DDL & Initial Seeds
│   └── init.sql
└── docs/                     # SDLC Documentation
    ├── 01_Project_Abstract.md
    ├── 02_System_Architecture.md
    ├── 03_Database_Design.md
    ├── 04_REST_API_Reference.md
    └── 05_Deployment_Guide.md
```

---

## 🚀 Quick Start

### 1. Database
```bash
mysql -u root -p < database/init.sql
```

### 2. Backend
```bash
cd backend
mvn spring-boot:run
```
Backend runs at `http://localhost:8080`.

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`.

---

## 🔑 Default Accounts

- **Admin**: `admin@college.edu` / `admin123`
- **Staff**: `staff.maintenance@college.edu` / `staff123`
- **Student**: Register a new student account at `http://localhost:5173/register`

---

## 📖 Complete Documentation
Detailed architectural and API documentation is available in the [`docs/`](docs/) directory.
