package com.anpl.repository;

import com.anpl.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findFirstByRegistration_IdOrderByCreatedAtDesc(Long registrationId);
    Optional<Payment> findByRazorpayPaymentId(String razorpayPaymentId);
    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);
    List<Payment> findByRegistration_User_Id(Long userId);
    List<Payment> findByRegistrationUserId(Long userId);
    List<Payment> findByPaymentStatus(String status);
} 