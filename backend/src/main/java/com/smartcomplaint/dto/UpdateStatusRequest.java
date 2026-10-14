package com.smartcomplaint.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import com.smartcomplaint.entity.ComplaintStatus;

/**
 * DTO for staff to update complaint status and add remarks.
 */
public class UpdateStatusRequest {

    @NotNull(message = "New status is required")
    private ComplaintStatus status;

    /** Progress notes or resolution remarks */
    @NotBlank(message = "Remarks are required when updating status")
    private String remarks;

    public UpdateStatusRequest() {}

    public ComplaintStatus getStatus() { return status; }
    public void setStatus(ComplaintStatus status) { this.status = status; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
