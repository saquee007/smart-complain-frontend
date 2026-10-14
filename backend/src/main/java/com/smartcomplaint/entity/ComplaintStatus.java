package com.smartcomplaint.entity;

/**
 * Enum representing the lifecycle statuses of a complaint.
 * SUBMITTED   - Complaint has been submitted by a student.
 * ASSIGNED    - Admin has assigned the complaint to a staff member.
 * IN_PROGRESS - Staff is actively working on the complaint.
 * RESOLVED    - Staff has resolved the complaint.
 * REJECTED    - Admin has rejected the complaint.
 */
public enum ComplaintStatus {
    SUBMITTED,
    ASSIGNED,
    IN_PROGRESS,
    RESOLVED,
    REJECTED
}
