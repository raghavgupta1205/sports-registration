package com.anpl.service;

import com.anpl.model.User;
import com.anpl.model.EventRegistration;

public interface EmailService {
    void sendWelcomeEmail(User user);
    void sendEventRegistrationEmail(User user, EventRegistration registration);
    void sendRegistrationStatusUpdateEmail(User user, EventRegistration registration);
    void sendPaymentSuccessEmail(User user);
    void sendPasswordResetEmail(User user, String resetToken);
} 