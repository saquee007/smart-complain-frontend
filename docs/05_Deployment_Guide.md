# Getting Started & Deployment Guide

This guide walks through running the Smart Complaint Management System locally from scratch.

---

## 1. Prerequisites
- **Java**: JDK 17 or higher (`java -version`)
- **Maven**: 3.8+ (or use the provided Maven wrapper)
- **Node.js**: v18.0.0 or higher (`node -v`)
- **MySQL**: 8.0+ running on port 3306

---

## 2. Database Setup

1. Start your local MySQL service.
2. Connect to MySQL client:
   ```bash
   mysql -u root -p
   ```
3. Run the initialization script located at `database/init.sql`:
   ```sql
   source /path/to/smart-complaint/database/init.sql;
   ```
   *(This creates `smart_complaint_db` and seeds initial accounts).*

---

## 3. Backend Setup & Run

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Copy environment template and configure:
   ```bash
   cp .env.example .env
   ```
3. Set your database credentials in `.env` (or let it read system environment variables):
   ```env
   DB_URL=jdbc:mysql://localhost:3306/smart_complaint_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
   DB_USERNAME=root
   DB_PASSWORD=your_mysql_password
   JWT_SECRET=yourSuperSecret256BitKeyWithAtLeast32CharactersLong!
   AI_PROVIDER=fallback
   ```
   *(To use real AI, set `AI_PROVIDER=gemini` or `openai` and fill in `AI_API_KEY`).*

4. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
   The backend will start at `http://localhost:8080`.

---

## 4. Frontend Setup & Run

1. In a separate terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 5. Default Credentials for Testing

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| **Admin** | `admin@college.edu` | `admin123` | System oversight, approving AI suggestions, staff routing |
| **Staff (Maintenance)** | `staff.maintenance@college.edu` | `staff123` | Resolving equipment/infrastructure tickets |
| **Staff (IT)** | `staff.it@college.edu` | `staff123` | Resolving networking/lab PC tickets |
| **Staff (Housekeeping)** | `staff.housekeeping@college.edu` | `staff123` | Resolving cleanliness tickets |
| **Student** | Self-register on the Register page | (Your choice) | Submitting plain text complaints & tracking |
