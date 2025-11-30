package com.anpl.repository;

import com.anpl.model.BadmintonRegistrationBundle;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BadmintonRegistrationBundleRepository extends JpaRepository<BadmintonRegistrationBundle, Long> {

    @EntityGraph(attributePaths = {"entries", "entries.category"})
    Optional<BadmintonRegistrationBundle> findById(Long id);

    @EntityGraph(attributePaths = {"entries", "entries.category"})
    List<BadmintonRegistrationBundle> findByUserId(Long userId);

    @EntityGraph(attributePaths = {"entries", "entries.category"})
    Optional<BadmintonRegistrationBundle> findFirstByUserIdAndEventIdAndBundleStatusOrderByUpdatedAtDesc(
            Long userId,
            Long eventId,
            com.anpl.model.RegistrationStatus bundleStatus);

    Optional<BadmintonRegistrationBundle> findByPaymentOrderId(String paymentOrderId);
}

