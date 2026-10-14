package com.smartcomplaint.dto;

import java.util.Map;

/**
 * DTO for dashboard statistics.
 * Used by both admin and student dashboards.
 */
public class DashboardStats {

    private long totalComplaints;
    private long submitted;
    private long assigned;
    private long inProgress;
    private long resolved;
    private long rejected;
    private Map<String, Long> byCategory;
    private Map<String, Long> byPriority;

    public DashboardStats() {}

    public long getTotalComplaints() { return totalComplaints; }
    public void setTotalComplaints(long totalComplaints) { this.totalComplaints = totalComplaints; }

    public long getSubmitted() { return submitted; }
    public void setSubmitted(long submitted) { this.submitted = submitted; }

    public long getAssigned() { return assigned; }
    public void setAssigned(long assigned) { this.assigned = assigned; }

    public long getInProgress() { return inProgress; }
    public void setInProgress(long inProgress) { this.inProgress = inProgress; }

    public long getResolved() { return resolved; }
    public void setResolved(long resolved) { this.resolved = resolved; }

    public long getRejected() { return rejected; }
    public void setRejected(long rejected) { this.rejected = rejected; }

    public Map<String, Long> getByCategory() { return byCategory; }
    public void setByCategory(Map<String, Long> byCategory) { this.byCategory = byCategory; }

    public Map<String, Long> getByPriority() { return byPriority; }
    public void setByPriority(Map<String, Long> byPriority) { this.byPriority = byPriority; }
}
