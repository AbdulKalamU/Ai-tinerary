package com.aitinerary.ai;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for AI usage tracking records.
 * Provides queries for analyzing usage patterns and costs per user.
 */
@Repository
public interface AiUsageRepository extends JpaRepository<AiUsageRecord, Long> {

    /**
     * Find all usage records for a specific user.
     *
     * @param userId the user's ID
     * @return list of usage records ordered by creation time
     */
    List<AiUsageRecord> findByUserId(Long userId);

    /**
     * Find usage records for a user created after a specific timestamp.
     * Useful for querying today's usage or recent activity.
     *
     * @param userId the user's ID
     * @param after  the timestamp cutoff
     * @return list of recent usage records
     */
    List<AiUsageRecord> findByUserIdAndCreatedAtAfter(Long userId, LocalDateTime after);
}
