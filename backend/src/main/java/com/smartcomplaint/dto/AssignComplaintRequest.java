package com.smartcomplaint.dto;

import jakarta.validation.constraints.NotNull;

/**
 * DTO for admin to assign a complaint to a staff member
 * and optionally correct the AI-suggested classification.
 */
public class AssignComplaintRequest {

    @NotNull(message = "Staff ID is required")
    private Long staffId;

    /** Admin can correct the category (optional - uses AI suggestion if null) */
    private String category;

    /** Admin can correct the priority (optional - uses AI suggestion if null) */
    private String priority;

    /** Admin can correct the department (optional - uses AI suggestion if null) */
    private String department;

    public AssignComplaintRequest() {}

    public Long getStaffId() { return staffId; }
    public void setStaffId(Long staffId) { this.staffId = staffId; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
}
