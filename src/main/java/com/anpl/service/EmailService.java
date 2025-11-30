package com.anpl.service;

import com.anpl.model.User;
import com.anpl.model.Event;
import com.anpl.model.EventRegistration;
import com.anpl.model.PlayerProfile;
import com.anpl.model.CricketPlayerSkills;
import com.anpl.model.BadmintonRegistrationEntry;

import java.util.List;

public interface EmailService {
    void sendWelcomeEmail(User user);
    void sendEventRegistrationEmail(User user, EventRegistration registration);
    void sendCricketRegistrationEmail(User user,
                                      Event event,
                                      EventRegistration registration,
                                      PlayerProfile playerProfile,
                                      CricketPlayerSkills cricketPlayerSkills);
    void sendBadmintonRegistrationEmail(User registrant, Event event, List<BadmintonRegistrationEntry> entries);
    void sendBadmintonPartnerEmail(User partner, User registrant, Event event, List<BadmintonRegistrationEntry> entries);
    void sendPaymentSuccessEmail(User user);
    void sendPasswordResetEmail(User user, String resetUrl);
} 