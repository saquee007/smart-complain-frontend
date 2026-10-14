package com.smartcomplaint.repository;

import com.smartcomplaint.entity.StatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repository for StatusHistory entity database operations.
 */
@Repository
public interface StatusHistoryRepository extends JpaRepository<StatusHistory, Long> {

    /** Find all status history entries for a complaint, ordered by time */
    List<StatusHistory> findByComplaintIdOrderByChangedAtAsc(Long complaintId);
}
