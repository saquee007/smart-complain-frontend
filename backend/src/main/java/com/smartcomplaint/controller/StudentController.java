package com.smartcomplaint.controller;

import com.smartcomplaint.dto.ComplaintRequest;
import com.smartcomplaint.dto.ComplaintResponse;
import com.smartcomplaint.service.ComplaintService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for student-specific endpoints.
 * All endpoints require STUDENT role (enforced by SecurityConfig URL rules).
 *
 * Students can:
 * - Submit new complaints
 * - View their own complaints
 * - View complaint details and tracking history
 */
@RestController
@RequestMapping("/api/student")
public class StudentController {

    private final ComplaintService complaintService;

    public StudentController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    /**
     * POST /api/student/complaints
     * Submit a new complaint. AI classification runs automatically.
     */
    @PostMapping("/complaints")
    public ResponseEntity<ComplaintResponse> submitComplaint(
            @Valid @RequestBody ComplaintRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        ComplaintResponse response = complaintService.createComplaint(
                request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/student/complaints
     * Get all complaints submitted by the logged-in student.
     */
    @GetMapping("/complaints")
    public ResponseEntity<List<ComplaintResponse>> getMyComplaints(
            @AuthenticationPrincipal UserDetails userDetails) {

        List<ComplaintResponse> complaints = complaintService.getStudentComplaints(
                userDetails.getUsername());
        return ResponseEntity.ok(complaints);
    }

    /**
     * GET /api/student/complaints/{id}
     * Get a specific complaint with tracking details.
     * Only the student who submitted it can view it.
     */
    @GetMapping("/complaints/{id}")
    public ResponseEntity<ComplaintResponse> getComplaintDetails(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        ComplaintResponse response = complaintService.getStudentComplaintById(
                id, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }
}
