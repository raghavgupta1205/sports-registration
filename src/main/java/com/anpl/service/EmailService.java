package com.anpl.service;

import com.anpl.model.User;
import com.anpl.model.Event;
import com.anpl.model.EventRegistration;
import com.anpl.model.PlayerProfile;
import com.anpl.model.CricketPlayerSkills;

public interface EmailService {
    void sendWelcomeEmail(User user);
    void sendEventRegistrationEmail(User user, EventRegistration registration);
    void sendCricketRegistrationEmail(User user,
                                      Event event,
                                      EventRegistration registration,
                                      PlayerProfile playerProfile,
                                      CricketPlayerSkills cricketPlayerSkills);
    void sendRegistrationStatusUpdateEmail(User user, EventRegistration registration);
    void sendPaymentSuccessEmail(User user);
    void sendPasswordResetEmail(User user, String resetUrl);
} 