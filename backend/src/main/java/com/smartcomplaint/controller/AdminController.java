package com.smartcomplaint.controller;

import com.smartcomplaint.dto.*;
import com.smartcomplaint.service.ComplaintService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for admin-specific endpoints.
 * All endpoints require ADMIN role (enforced by SecurityConfig URL rules).
 *
 * Admins can:
 * - View all complaints
 * - Review AI classification results
 * - Assign complaints to staff (with optional classification corrections)
 * - Reject complaints
 * - View dashboard statistics
 * - View all staff members
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final ComplaintService complaintService;

    public AdminController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    /**
     * GET /api/admin/complaints
     * Get all complaints in the system.
     */
    @GetMapping("/complaints")
    public ResponseEntity<List<ComplaintResponse>> getAllComplaints() {
        return ResponseEntity.ok(complaintService.getAllComplaints());
    }

    /**
     * GET /api/admin/complaints/{id}
     * Get a specific complaint with full details.
     */
    @GetMapping("/complaints/{id}")
    public ResponseEntity<ComplaintResponse> getComplaint(@PathVariable Long id) {
        return ResponseEntity.ok(complaintService.getComplaintById(id));
    }

    /**
     * POST /api/admin/complaints/{id}/assign
     * Assign a complaint to a staff member.
     * Admin can also correct the AI classification here.
     */
    @PostMapping("/complaints/{id}/assign")
    public ResponseEntity<ComplaintResponse> assignComplaint(
            @PathVariable Long id,
            @Valid @RequestBody AssignComplaintRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        ComplaintResponse response = complaintService.assignComplaint(
                id, request, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/admin/complaints/{id}/reject
     * Reject a complaint with remarks.
     */
    @PostMapping("/complaints/{id}/reject")
    public ResponseEntity<ComplaintResponse> rejectComplaint(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {

        String remarks = body != null ? body.get("remarks") : "Rejected by admin";
        ComplaintResponse response = complaintService.rejectComplaint(
                id, remarks, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/admin/staff
     * Get all staff members for assignment dropdown.
     */
    @GetMapping("/staff")
    public ResponseEntity<List<UserResponse>> getAllStaff() {
        return ResponseEntity.ok(complaintService.getAllStaff());
    }

    /**
     * GET /api/admin/stats
     * Get dashboard statistics.
     */
    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getStats() {
        return ResponseEntity.ok(complaintService.getAdminStats());
    }
}
