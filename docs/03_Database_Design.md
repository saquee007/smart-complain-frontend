# Database Schema, ER Diagram & DDL

## 1. Entity Relationship (ER) Diagram

```
┌───────────────────────────────────────────────┐
│                    users                      │
├───────────────────┬──────────────┬────────────┤
│ id (PK)           │ BIGINT       │ AUTO_INCR  │
│ email (UQ)        │ VARCHAR(100) │ NOT NULL   │
│ password          │ VARCHAR(255) │ NOT NULL   │
│ full_name         │ VARCHAR(100) │ NOT NULL   │
│ role              │ VARCHAR(20)  │ NOT NULL   │
│ department        │ VARCHAR(50)  │ NULL       │
│ created_at        │ TIMESTAMP    │ NOT NULL   │
└─────────┬─────────────────────────┬───────────┘
          │ 1                       │ 1
          │ submitted by            │ assigned to
          │                         │
          │ N                       │ N
┌─────────▼─────────────────────────▼───────────┐
│                  complaints                   │
├───────────────────┬──────────────┬────────────┤
│ id (PK)           │ BIGINT       │ AUTO_INCR  │
│ title             │ VARCHAR(200) │ NOT NULL   │
│ description       │ TEXT         │ NOT NULL   │
│ location          │ VARCHAR(200) │ NULL       │
│ status            │ VARCHAR(30)  │ NOT NULL   │
│ ai_category       │ VARCHAR(50)  │ NULL       │
│ ai_priority       │ VARCHAR(30)  │ NULL       │
│ ai_department     │ VARCHAR(50)  │ NULL       │
│ ai_reason         │ TEXT         │ NULL       │
│ ai_fallback       │ BOOLEAN      │ DEFAULT 0  │
│ category          │ VARCHAR(50)  │ NULL       │
│ priority          │ VARCHAR(30)  │ NULL       │
│ department        │ VARCHAR(50)  │ NULL       │
│ student_id (FK)   │ BIGINT       │ NOT NULL   │
│ assigned_staff(FK)│ BIGINT       │ NULL       │
│ resolution_remarks│ TEXT         │ NULL       │
│ created_at        │ TIMESTAMP    │ NOT NULL   │
│ updated_at        │ TIMESTAMP    │ NOT NULL   │
└───────────────────┬───────────────────────────┘
                    │ 1
                    │ has history entries
                    │ N
┌───────────────────▼───────────────────────────┐
│                status_history                 │
├───────────────────┬──────────────┬────────────┤
│ id (PK)           │ BIGINT       │ AUTO_INCR  │
│ complaint_id (FK) │ BIGINT       │ NOT NULL   │
│ old_status        │ VARCHAR(30)  │ NULL       │
│ new_status        │ VARCHAR(30)  │ NOT NULL   │
│ changed_by        │ VARCHAR(100) │ NOT NULL   │
│ remarks           │ TEXT         │ NULL       │
│ changed_at        │ TIMESTAMP    │ NOT NULL   │
└───────────────────┴──────────────┴────────────┘
```

## 2. Table Schemas & Constraints

- **users**:
  - `role`: Enum values `STUDENT`, `ADMIN`, `STAFF`
  - `email`: Indexed with unique constraint
- **complaints**:
  - `status`: Enum values `SUBMITTED`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `REJECTED`
  - Foreign key to `users(id)` as `student_id`
  - Foreign key to `users(id)` as `assigned_staff_id` (Nullable until assigned)
- **status_history**:
  - Audit log table tracking every state transition with who performed it and remarks.
