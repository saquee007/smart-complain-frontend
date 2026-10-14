package com.smartcomplaint.controller;

import com.smartcomplaint.dto.ComplaintResponse;
import com.smartcomplaint.dto.UpdateStatusRequest;
import com.smartcomplaint.service.ComplaintService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for staff-specific endpoints.
 * All endpoints require STAFF role (enforced by SecurityConfig URL rules).
 *
 * Staff can:
 * - View complaints assigned to them
 * - Update complaint status (IN_PROGRESS, RESOLVED)
 * - Add progress notes and resolution remarks
 */
@RestController
@RequestMapping("/api/staff")
public class StaffController {

    private final ComplaintService complaintService;

    public StaffController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    /**
     * GET /api/staff/complaints
     * Get all complaints assigned to the logged-in staff member.
     */
    @GetMapping("/complaints")
    public ResponseEntity<List<ComplaintResponse>> getAssignedComplaints(
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(complaintService.getStaffComplaints(userDetails.getUsername()));
    }

    /**
     * GET /api/staff/complaints/{id}
     * Get a specific assigned complaint with details.
     */
    @GetMapping("/complaints/{id}")
    public ResponseEntity<ComplaintResponse> getComplaintDetails(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(complaintService.getStaffComplaintById(id, userDetails.getUsername()));
    }

    /**
     * PUT /api/staff/complaints/{id}/status
     * Update the status of an assigned complaint.
     * Staff can set status to IN_PROGRESS or RESOLVED.
     */
    @PutMapping("/complaints/{id}/status")
    public ResponseEntity<ComplaintResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStatusRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        ComplaintResponse response = complaintService.updateComplaintStatus(
                id, request, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }
}
