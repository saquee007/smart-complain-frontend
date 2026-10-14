package com.smartcomplaint.dto;

import com.smartcomplaint.entity.ComplaintStatus;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for complaint API responses.
 * Contains all complaint details including AI suggestions and admin-approved values.
 */
public class ComplaintResponse {

    private Long id;
    private String title;
    private String description;
    private String location;

    // AI-Suggested fields
    private String aiCategory;
    private String aiPriority;
    private String aiDepartment;
    private String aiReason;
    private boolean aiFallback;

    // Admin-Approved fields
    private String category;
    private String priority;
    private String department;

    // Status
    private ComplaintStatus status;
    private String resolutionRemarks;

    // Related user info
    private String studentName;
    private String studentEmail;
    private Long studentId;
    private String assignedStaffName;
    private Long assignedStaffId;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Status history
    private List<StatusHistoryResponse> statusHistory;

    public ComplaintResponse() {}

    // === Getters and Setters ===

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getAiCategory() { return aiCategory; }
    public void setAiCategory(String aiCategory) { this.aiCategory = aiCategory; }

    public String getAiPriority() { return aiPriority; }
    public void setAiPriority(String aiPriority) { this.aiPriority = aiPriority; }

    public String getAiDepartment() { return aiDepartment; }
    public void setAiDepartment(String aiDepartment) { this.aiDepartment = aiDepartment; }

    public String getAiReason() { return aiReason; }
    public void setAiReason(String aiReason) { this.aiReason = aiReason; }

    public boolean isAiFallback() { return aiFallback; }
    public void setAiFallback(boolean aiFallback) { this.aiFallback = aiFallback; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public ComplaintStatus getStatus() { return status; }
    public void setStatus(ComplaintStatus status) { this.status = status; }

    public String getResolutionRemarks() { return resolutionRemarks; }
    public void setResolutionRemarks(String resolutionRemarks) { this.resolutionRemarks = resolutionRemarks; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getAssignedStaffName() { return assignedStaffName; }
    public void setAssignedStaffName(String assignedStaffName) { this.assignedStaffName = assignedStaffName; }

    public Long getAssignedStaffId() { return assignedStaffId; }
    public void setAssignedStaffId(Long assignedStaffId) { this.assignedStaffId = assignedStaffId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<StatusHistoryResponse> getStatusHistory() { return statusHistory; }
    public void setStatusHistory(List<StatusHistoryResponse> statusHistory) { this.statusHistory = statusHistory; }
}
