# System Architecture & Technical Specifications

## 1. High-Level Architecture

The system follows a multi-tier client-server architecture with stateless RESTful communication:

```
┌────────────────────────────────────────────────────────┐
│                   React 18 + Vite                      │
│            Single Page Application (SPA)               │
│      React Router v6 | Axios Interceptors | Context    │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP / JSON (Bearer JWT)
                           ▼
┌────────────────────────────────────────────────────────┐
│               Spring Boot 3.2.5 (Java 17)              │
│ ┌────────────────────────────────────────────────────┐ │
│ │  Spring Security Filter Chain & JWT Authenticator  │ │
│ └────────────────────────┬───────────────────────────┘ │
│ ┌────────────────────────▼───────────────────────────┐ │
│ │  Controllers: Auth, Student, Admin, Staff          │ │
│ └────────────────────────┬───────────────────────────┘ │
│ ┌────────────────────────▼───────────────────────────┐ │
│ │  Services: Complaint, Auth, AI Classification      │ │
│ └────────────────────────┬───────────────────────────┘ │
│ ┌────────────────────────▼───────────────────────────┐ │
│ │  Spring Data JPA / Hibernate Repositories          │ │
│ └────────────────────────┬───────────────────────────┘ │
└──────────────────────────┼─────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
   ┌──────────────────┐        ┌──────────────────┐
   │   MySQL 8.0+     │        │ OpenAI / Gemini  │
   │  Persistent DB   │        │ AI Engine (REST) │
   └──────────────────┘        └──────────────────┘
```

## 2. Component Breakdown

### Frontend (React + Vite)
- **State & Context Management**: `AuthContext` provides global authentication state with localStorage persistence.
- **HTTP Layer**: Axios client configured with interceptors that automatically attach Bearer JWT tokens and intercept 401 Unauthorized responses to prompt re-login.
- **Routing**: `react-router-dom` with `ProtectedRoute` guards restricting access based on user role (`STUDENT`, `ADMIN`, `STAFF`).
- **Styling**: Vanilla CSS design system incorporating modern HSL color palettes, responsive typography (`Plus Jakarta Sans`), glassmorphism navigation, and micro-animations.

### Backend (Spring Boot 3.2.5)
- **Authentication**: Stateless JWT security with BCrypt password hashing.
- **Audit Trail**: `StatusHistory` entity automatically records status transitions, user references, timestamps, and resolution notes.
- **AI Classification Service**: Dual-engine architecture supporting Gemini 1.5, OpenAI GPT-4o-mini, and a deterministic heuristic fallback engine.
- **Validation**: Jakarta Bean Validation (`@NotBlank`, `@Size`, `@Email`) applied on all DTO requests with clear error messages handled via `@RestControllerAdvice`.
