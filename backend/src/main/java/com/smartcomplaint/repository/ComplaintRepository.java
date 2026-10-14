package com.smartcomplaint.repository;

import com.smartcomplaint.entity.Complaint;
import com.smartcomplaint.entity.ComplaintStatus;
import com.smartcomplaint.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repository for Complaint entity database operations.
 */
@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    /** Find all complaints submitted by a specific student */
    List<Complaint> findByStudentOrderByCreatedAtDesc(User student);

    /** Find all complaints assigned to a specific staff member */
    List<Complaint> findByAssignedStaffOrderByCreatedAtDesc(User staff);

    /** Find all complaints with a specific status */
    List<Complaint> findByStatus(ComplaintStatus status);

    /** Count complaints by status */
    long countByStatus(ComplaintStatus status);

    /** Count complaints by student */
    long countByStudent(User student);

    /** Find all complaints ordered by creation date descending */
    List<Complaint> findAllByOrderByCreatedAtDesc();
}
