package com.aitinerary.trip;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TravelPlanRepository extends JpaRepository<TravelPlan, Long> {

    List<TravelPlan> findByUserIdOrderByCreatedAtDesc(Long userId);

    Page<TravelPlan> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Optional<TravelPlan> findByIdAndUserId(Long id, Long userId);

    void deleteByIdAndUserId(Long id, Long userId);
}
