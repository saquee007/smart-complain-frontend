package com.smartcomplaint.dto;

/**
 * DTO representing AI classification results.
 * Contains the suggested category, priority, department, and reasoning.
 */
public class AiClassificationResult {

    private String category;
    private String priority;
    private String department;
    private String shortReason;
    private boolean fallback;

    public AiClassificationResult() {}

    public AiClassificationResult(String category, String priority,
                                   String department, String shortReason, boolean fallback) {
        this.category = category;
        this.priority = priority;
        this.department = department;
        this.shortReason = shortReason;
        this.fallback = fallback;
    }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getShortReason() { return shortReason; }
    public void setShortReason(String shortReason) { this.shortReason = shortReason; }

    public boolean isFallback() { return fallback; }
    public void setFallback(boolean fallback) { this.fallback = fallback; }
}
