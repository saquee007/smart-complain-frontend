package com.smartcomplaint.service;

import com.smartcomplaint.dto.*;
import com.smartcomplaint.entity.*;
import com.smartcomplaint.exception.BadRequestException;
import com.smartcomplaint.exception.ResourceNotFoundException;
import com.smartcomplaint.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service layer for complaint operations.
 * Handles complaint creation, assignment, status updates, and statistics.
 * Enforces business rules like ownership checks and valid status transitions.
 */
@Service
public class ComplaintService {

    private static final Logger logger = LoggerFactory.getLogger(ComplaintService.class);

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final StatusHistoryRepository statusHistoryRepository;
    private final AiClassificationService aiClassificationService;

    public ComplaintService(ComplaintRepository complaintRepository,
                            UserRepository userRepository,
                            StatusHistoryRepository statusHistoryRepository,
                            AiClassificationService aiClassificationService) {
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.aiClassificationService = aiClassificationService;
    }

    // ======================================================================
    // STUDENT OPERATIONS
    // ======================================================================

    /**
     * Create a new complaint by a student.
     * After saving, the complaint is classified by AI (or fallback).
     */
    @Transactional
    public ComplaintResponse createComplaint(ComplaintRequest request, String studentEmail) {
        User student = findUserByEmail(studentEmail);

        // Create and save the complaint
        Complaint complaint = new Complaint();
        complaint.setTitle(request.getTitle());
        complaint.setDescription(request.getDescription());
        complaint.setLocation(request.getLocation());
        complaint.setStudent(student);
        complaint.setStatus(ComplaintStatus.SUBMITTED);

        // Run AI classification
        AiClassificationResult aiResult = aiClassificationService.classify(
                request.getTitle(), request.getDescription());

        complaint.setAiCategory(aiResult.getCategory());
        complaint.setAiPriority(aiResult.getPriority());
        complaint.setAiDepartment(aiResult.getDepartment());
        complaint.setAiReason(aiResult.getShortReason());
        complaint.setAiFallback(aiResult.isFallback());

        complaint = complaintRepository.save(complaint);

        // Record initial status in history
        addStatusHistory(complaint, null, ComplaintStatus.SUBMITTED,
                student.getFullName(), "Complaint submitted");

        logger.info("Complaint #{} created by student: {}", complaint.getId(), studentEmail);
        return mapToResponse(complaint);
    }

    /**
     * Get all complaints submitted by a specific student.
     * Ensures students can only see their own complaints.
     */
    public List<ComplaintResponse> getStudentComplaints(String studentEmail) {
        User student = findUserByEmail(studentEmail);
        List<Complaint> complaints = complaintRepository.findByStudentOrderByCreatedAtDesc(student);
        return complaints.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    /**
     * Get a specific complaint by ID.
     * Verifies that the student owns this complaint.
     */
    public ComplaintResponse getStudentComplaintById(Long complaintId, String studentEmail) {
        User student = findUserByEmail(studentEmail);
        Complaint complaint = findComplaintById(complaintId);

        // Security check: student can only view their own complaints
        if (!complaint.getStudent().getId().equals(student.getId())) {
            throw new BadRequestException("You can only view your own complaints");
        }

        return mapToResponse(complaint);
    }

    // ======================================================================
    // ADMIN OPERATIONS
    // ======================================================================

    /**
     * Get all complaints (admin view).
     */
    public List<ComplaintResponse> getAllComplaints() {
        List<Complaint> complaints = complaintRepository.findAllByOrderByCreatedAtDesc();
        return complaints.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    /**
     * Get a specific complaint by ID (admin view — no ownership check).
     */
    public ComplaintResponse getComplaintById(Long complaintId) {
        Complaint complaint = findComplaintById(complaintId);
        return mapToResponse(complaint);
    }

    /**
     * Admin assigns a complaint to a staff member.
     * Can also correct the AI classification.
     */
    @Transactional
    public ComplaintResponse assignComplaint(Long complaintId, AssignComplaintRequest request,
                                             String adminEmail) {
        User admin = findUserByEmail(adminEmail);
        Complaint complaint = findComplaintById(complaintId);
        User staff = userRepository.findById(request.getStaffId())
                .orElseThrow(() -> new ResourceNotFoundException("Staff member not found"));

        // Verify the assigned user is actually a STAFF member
        if (staff.getRole() != Role.STAFF) {
            throw new BadRequestException("Selected user is not a staff member");
        }

        // Set admin-approved classification (use AI suggestions as defaults)
        complaint.setCategory(request.getCategory() != null ? request.getCategory() : complaint.getAiCategory());
        complaint.setPriority(request.getPriority() != null ? request.getPriority() : complaint.getAiPriority());
        complaint.setDepartment(request.getDepartment() != null ? request.getDepartment() : complaint.getAiDepartment());

        // Assign staff and update status
        ComplaintStatus oldStatus = complaint.getStatus();
        complaint.setAssignedStaff(staff);
        complaint.setStatus(ComplaintStatus.ASSIGNED);

        complaint = complaintRepository.save(complaint);

        // Record status change
        addStatusHistory(complaint, oldStatus, ComplaintStatus.ASSIGNED,
                admin.getFullName(), "Assigned to " + staff.getFullName());

        logger.info("Complaint #{} assigned to staff: {} by admin: {}",
                complaint.getId(), staff.getEmail(), adminEmail);
        return mapToResponse(complaint);
    }

    /**
     * Admin rejects a complaint.
     */
    @Transactional
    public ComplaintResponse rejectComplaint(Long complaintId, String remarks, String adminEmail) {
        User admin = findUserByEmail(adminEmail);
        Complaint complaint = findComplaintById(complaintId);

        ComplaintStatus oldStatus = complaint.getStatus();
        complaint.setStatus(ComplaintStatus.REJECTED);
        complaint.setResolutionRemarks(remarks);

        complaint = complaintRepository.save(complaint);

        addStatusHistory(complaint, oldStatus, ComplaintStatus.REJECTED,
                admin.getFullName(), remarks != null ? remarks : "Complaint rejected by admin");

        return mapToResponse(complaint);
    }

    /**
     * Get all staff members (for admin to choose when assigning).
     */
    public List<UserResponse> getAllStaff() {
        return userRepository.findByRole(Role.STAFF).stream()
                .map(user -> new UserResponse(
                        user.getId(),
                        user.getFullName(),
                        user.getEmail(),
                        user.getRole().name(),
                        user.getDepartment()))
                .collect(Collectors.toList());
    }

    /**
     * Get dashboard statistics for admin.
     */
    public DashboardStats getAdminStats() {
        DashboardStats stats = new DashboardStats();

        List<Complaint> allComplaints = complaintRepository.findAll();
        stats.setTotalComplaints(allComplaints.size());
        stats.setSubmitted(complaintRepository.countByStatus(ComplaintStatus.SUBMITTED));
        stats.setAssigned(complaintRepository.countByStatus(ComplaintStatus.ASSIGNED));
        stats.setInProgress(complaintRepository.countByStatus(ComplaintStatus.IN_PROGRESS));
        stats.setResolved(complaintRepository.countByStatus(ComplaintStatus.RESOLVED));
        stats.setRejected(complaintRepository.countByStatus(ComplaintStatus.REJECTED));

        // Count by category (using admin-approved category, falling back to AI category)
        Map<String, Long> byCategory = allComplaints.stream()
                .collect(Collectors.groupingBy(
                        c -> c.getCategory() != null ? c.getCategory() :
                                (c.getAiCategory() != null ? c.getAiCategory() : "Unclassified"),
                        Collectors.counting()));
        stats.setByCategory(byCategory);

        // Count by priority
        Map<String, Long> byPriority = allComplaints.stream()
                .collect(Collectors.groupingBy(
                        c -> c.getPriority() != null ? c.getPriority() :
                                (c.getAiPriority() != null ? c.getAiPriority() : "Unset"),
                        Collectors.counting()));
        stats.setByPriority(byPriority);

        return stats;
    }

    // ======================================================================
    // STAFF OPERATIONS
    // ======================================================================

    /**
     * Get all complaints assigned to a specific staff member.
     */
    public List<ComplaintResponse> getStaffComplaints(String staffEmail) {
        User staff = findUserByEmail(staffEmail);
        List<Complaint> complaints = complaintRepository.findByAssignedStaffOrderByCreatedAtDesc(staff);
        return complaints.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    /**
     * Staff updates the status of a complaint assigned to them.
     * Staff can only set status to IN_PROGRESS or RESOLVED.
     */
    @Transactional
    public ComplaintResponse updateComplaintStatus(Long complaintId, UpdateStatusRequest request,
                                                    String staffEmail) {
        User staff = findUserByEmail(staffEmail);
        Complaint complaint = findComplaintById(complaintId);

        // Security check: staff can only update complaints assigned to them
        if (complaint.getAssignedStaff() == null ||
                !complaint.getAssignedStaff().getId().equals(staff.getId())) {
            throw new BadRequestException("You can only update complaints assigned to you");
        }

        // Validate status transition
        ComplaintStatus newStatus = request.getStatus();
        if (newStatus != ComplaintStatus.IN_PROGRESS && newStatus != ComplaintStatus.RESOLVED) {
            throw new BadRequestException("Staff can only set status to IN_PROGRESS or RESOLVED");
        }

        ComplaintStatus oldStatus = complaint.getStatus();
        complaint.setStatus(newStatus);

        // If resolving, save the resolution remarks
        if (newStatus == ComplaintStatus.RESOLVED) {
            complaint.setResolutionRemarks(request.getRemarks());
        }

        complaint = complaintRepository.save(complaint);

        addStatusHistory(complaint, oldStatus, newStatus,
                staff.getFullName(), request.getRemarks());

        logger.info("Complaint #{} status updated to {} by staff: {}",
                complaint.getId(), newStatus, staffEmail);
        return mapToResponse(complaint);
    }

    /**
     * Get a specific complaint assigned to a staff member.
     */
    public ComplaintResponse getStaffComplaintById(Long complaintId, String staffEmail) {
        User staff = findUserByEmail(staffEmail);
        Complaint complaint = findComplaintById(complaintId);

        // Security check
        if (complaint.getAssignedStaff() == null ||
                !complaint.getAssignedStaff().getId().equals(staff.getId())) {
            throw new BadRequestException("You can only view complaints assigned to you");
        }

        return mapToResponse(complaint);
    }

    // ======================================================================
    // HELPER METHODS
    // ======================================================================

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private Complaint findComplaintById(Long id) {
        return complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + id));
    }

    /**
     * Record a status change in the history table.
     */
    private void addStatusHistory(Complaint complaint, ComplaintStatus oldStatus,
                                   ComplaintStatus newStatus, String changedBy, String remarks) {
        StatusHistory history = new StatusHistory();
        history.setComplaint(complaint);
        history.setOldStatus(oldStatus != null ? oldStatus : newStatus);
        history.setNewStatus(newStatus);
        history.setChangedBy(changedBy);
        history.setRemarks(remarks);
        statusHistoryRepository.save(history);
    }

    /**
     * Map a Complaint entity to a ComplaintResponse DTO.
     * This prevents exposing internal entity structure and passwords.
     */
    private ComplaintResponse mapToResponse(Complaint complaint) {
        ComplaintResponse response = new ComplaintResponse();
        response.setId(complaint.getId());
        response.setTitle(complaint.getTitle());
        response.setDescription(complaint.getDescription());
        response.setLocation(complaint.getLocation());

        // AI suggestions
        response.setAiCategory(complaint.getAiCategory());
        response.setAiPriority(complaint.getAiPriority());
        response.setAiDepartment(complaint.getAiDepartment());
        response.setAiReason(complaint.getAiReason());
        response.setAiFallback(complaint.isAiFallback());

        // Admin-approved values
        response.setCategory(complaint.getCategory());
        response.setPriority(complaint.getPriority());
        response.setDepartment(complaint.getDepartment());

        // Status
        response.setStatus(complaint.getStatus());
        response.setResolutionRemarks(complaint.getResolutionRemarks());

        // Student info
        if (complaint.getStudent() != null) {
            response.setStudentName(complaint.getStudent().getFullName());
            response.setStudentEmail(complaint.getStudent().getEmail());
            response.setStudentId(complaint.getStudent().getId());
        }

        // Staff info
        if (complaint.getAssignedStaff() != null) {
            response.setAssignedStaffName(complaint.getAssignedStaff().getFullName());
            response.setAssignedStaffId(complaint.getAssignedStaff().getId());
        }

        // Timestamps
        response.setCreatedAt(complaint.getCreatedAt());
        response.setUpdatedAt(complaint.getUpdatedAt());

        // Status history
        List<StatusHistory> history = statusHistoryRepository
                .findByComplaintIdOrderByChangedAtAsc(complaint.getId());
        response.setStatusHistory(history.stream()
                .map(this::mapStatusHistory)
                .collect(Collectors.toList()));

        return response;
    }

    private StatusHistoryResponse mapStatusHistory(StatusHistory history) {
        StatusHistoryResponse response = new StatusHistoryResponse();
        response.setId(history.getId());
        response.setOldStatus(history.getOldStatus());
        response.setNewStatus(history.getNewStatus());
        response.setChangedBy(history.getChangedBy());
        response.setRemarks(history.getRemarks());
        response.setChangedAt(history.getChangedAt());
        return response;
    }
}
