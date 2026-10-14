package com.smartcomplaint.entity;

/**
 * Enum representing the roles available in the system.
 * STUDENT - Can submit and track complaints.
 * ADMIN   - Can manage complaints, review AI suggestions, assign staff.
 * STAFF   - Can work on assigned complaints and update their status.
 */
public enum Role {
    STUDENT,
    ADMIN,
    STAFF
}
