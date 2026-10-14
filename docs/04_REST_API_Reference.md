# REST API Reference & Postman Guide

Base URL: `http://localhost:8080/api`

All endpoints except `/auth/**` require the header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 1. Authentication Endpoints (`/auth`)

### 1.1 Register Student
- **Method**: `POST`
- **URL**: `/auth/register`
- **Request Body**:
```json
{
  "fullName": "Jane Doe",
  "email": "jane.doe@college.edu",
  "password": "password123"
}
```
- **Response** (`201 Created`):
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ...",
  "userId": 4,
  "fullName": "Jane Doe",
  "email": "jane.doe@college.edu",
  "role": "STUDENT"
}
```

### 1.2 Login
- **Method**: `POST`
- **URL**: `/auth/login`
- **Request Body**:
```json
{
  "email": "admin@college.edu",
  "password": "admin123"
}
```
- **Response** (`200 OK`):
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ...",
  "userId": 1,
  "fullName": "System Administrator",
  "email": "admin@college.edu",
  "role": "ADMIN"
}
```

---

## 2. Student Endpoints (`/student`)
*Required Role: `ROLE_STUDENT`*

### 2.1 Submit Complaint
- **Method**: `POST`
- **URL**: `/student/complaints`
- **Request Body**:
```json
{
  "title": "Air conditioning unit leaking water in Lab 3",
  "description": "The AC unit in Lab 3 is constantly dripping water onto the computer desks. Needs urgent repair.",
  "location": "Science Block, 1st Floor, Lab 3"
}
```
- **Response** (`201 Created`): Returns `ComplaintResponse` including AI classification suggestions.

### 2.2 Get My Complaints
- **Method**: `GET`
- **URL**: `/student/complaints`
- **Response** (`200 OK`): Returns JSON array of student's submitted complaints.

### 2.3 Get Complaint Details
- **Method**: `GET`
- **URL**: `/student/complaints/{id}`
- **Response** (`200 OK`): Returns complaint details with full status history and timeline.

---

## 3. Administrator Endpoints (`/admin`)
*Required Role: `ROLE_ADMIN`*

### 3.1 Get All Complaints
- **Method**: `GET`
- **URL**: `/admin/complaints`

### 3.2 Get Complaint Details
- **Method**: `GET`
- **URL**: `/admin/complaints/{id}`

### 3.3 Assign Complaint & Approve Classification
- **Method**: `POST`
- **URL**: `/admin/complaints/{id}/assign`
- **Request Body**:
```json
{
  "staffId": 2,
  "category": "Infrastructure",
  "priority": "High",
  "department": "Maintenance"
}
```

### 3.4 Reject Complaint
- **Method**: `POST`
- **URL**: `/admin/complaints/{id}/reject`
- **Request Body**:
```json
{
  "remarks": "Duplicate complaint already registered under #12."
}
```

### 3.5 List Staff Members
- **Method**: `GET`
- **URL**: `/admin/staff`

### 3.6 Get Dashboard Statistics
- **Method**: `GET`
- **URL**: `/admin/stats`

---

## 4. Staff Endpoints (`/staff`)
*Required Role: `ROLE_STAFF`*

### 4.1 Get Assigned Complaints
- **Method**: `GET`
- **URL**: `/staff/complaints`

### 4.2 Update Complaint Status
- **Method**: `PUT`
- **URL**: `/staff/complaints/{id}/status`
- **Request Body**:
```json
{
  "status": "RESOLVED",
  "remarks": "Cleaned air conditioner filter and fixed drainage pipe. Tested functioning."
}
```
