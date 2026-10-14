-- ============================================================
-- Smart Complaint Management System - Database Setup Script
-- ============================================================
-- This script creates the MySQL database for the application.
-- Run this script BEFORE starting the Spring Boot backend.
--
-- Usage:
--   mysql -u root -p < init.sql
--
-- Note: Spring Boot with JPA (ddl-auto=update) will automatically
-- create/update the tables. This script just creates the database.
-- ============================================================

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS smart_complaint_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- Switch to the new database
USE smart_complaint_db;

-- ============================================================
-- OPTIONAL: If you want to create a dedicated MySQL user
-- instead of using root (recommended for production)
-- ============================================================
-- CREATE USER IF NOT EXISTS 'smartcomplaint_user'@'localhost'
--     IDENTIFIED BY 'your_secure_password_here';
--
-- GRANT ALL PRIVILEGES ON smart_complaint_db.*
--     TO 'smartcomplaint_user'@'localhost';
--
-- FLUSH PRIVILEGES;

-- ============================================================
-- The following tables are created automatically by JPA.
-- They are documented here for reference.
-- ============================================================

-- Table: users
-- Stores all users (students, admins, staff)
-- Columns: id, full_name, email, password (bcrypt hash),
--           role (STUDENT/ADMIN/STAFF), department, created_at

-- Table: complaints
-- Stores complaint submissions and their classifications
-- Columns: id, title, description, location,
--           ai_category, ai_priority, ai_department, ai_reason, ai_fallback,
--           category, priority, department (admin-approved),
--           status (SUBMITTED/ASSIGNED/IN_PROGRESS/RESOLVED/REJECTED),
--           student_id, assigned_staff_id, resolution_remarks,
--           created_at, updated_at

-- Table: status_history
-- Records every status change of a complaint
-- Columns: id, complaint_id, old_status, new_status,
--           changed_by, remarks, changed_at
