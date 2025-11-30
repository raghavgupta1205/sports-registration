package com.anpl.service;

import com.anpl.model.User;
import com.anpl.model.Event;
import com.anpl.model.EventRegistration;
import com.anpl.model.PlayerProfile;
import com.anpl.model.CricketPlayerSkills;
import com.anpl.model.BadmintonRegistrationEntry;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {
    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.email.brand-name:Aggar Nagar Premier League}")
    private String brandName;

    @Value("${app.email.assets.logo.default:https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=320&q=80}")
    private String defaultLogoUrl;

    @Value("${app.email.assets.logo.cricket:https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=320&q=80}")
    private String cricketLogoUrl;

    @Value("${app.email.assets.logo.badminton:https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=320&q=80}")
    private String badmintonLogoUrl;

    @Value("${app.email.assets.banner.default:https://images.unsplash.com/photo-1505843513577-22bb7d21e455?auto=format&fit=crop&w=1200&q=80}")
    private String defaultBannerUrl;

    @Value("${app.email.assets.banner.cricket:https://images.unsplash.com/photo-1505842465776-3acb31c3c3c9?auto=format&fit=crop&w=1200&q=80}")
    private String cricketBannerUrl;

    @Value("${app.email.assets.banner.badminton:https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80}")
    private String badmintonBannerUrl;

    @Override
    public void sendWelcomeEmail(User user) {
        Context context = baseContext();
        context.setVariable("user", user);
        context.setVariable("logoImage", defaultLogoUrl);
        context.setVariable("heroImage", defaultBannerUrl);
        String content = templateEngine.process("welcome-email", context);
        sendEmail(user.getEmail(), "Welcome to ANPL Registration", content);
    }

    @Override
    public void sendEventRegistrationEmail(User user, EventRegistration registration) {
        Context context = baseContext();
        context.setVariable("user", user);
        context.setVariable("registration", registration);
        context.setVariable("logoImage", defaultLogoUrl);
        context.setVariable("heroImage", defaultBannerUrl);
        String content = templateEngine.process("event-registration", context);
        sendEmail(user.getEmail(), "ANPL Event Registration Confirmation", content);
    }

    @Override
    public void sendCricketRegistrationEmail(User user,
                                             Event event,
                                             EventRegistration registration,
                                             PlayerProfile playerProfile,
                                             CricketPlayerSkills cricketPlayerSkills) {
        Context context = baseContext();
        context.setVariable("user", user);
        context.setVariable("event", event);
        context.setVariable("registration", registration);
        context.setVariable("playerProfile", playerProfile);
        context.setVariable("cricketSkills", cricketPlayerSkills);
        context.setVariable("logoImage", cricketLogoUrl);
        context.setVariable("heroImage", cricketBannerUrl);
        String content = templateEngine.process("cricket-registration", context);
        sendEmail(user.getEmail(), "Cricket Registration Received", content);
    }

    @Override
    public void sendPasswordResetEmail(User user, String resetUrl) {
        Context context = baseContext();
        context.setVariable("user", user);
        context.setVariable("resetUrl", resetUrl);
        context.setVariable("logoImage", defaultLogoUrl);
        context.setVariable("heroImage", defaultBannerUrl);
        context.setVariable("ctaUrl", resetUrl);
        context.setVariable("ctaLabel", "Reset Password");
        String content = templateEngine.process("password-reset", context);
        sendEmail(user.getEmail(), "ANPL Password Reset Request", content);
    }

    @Override
    public void sendPaymentSuccessEmail(User user) {
        Context context = baseContext();
        context.setVariable("user", user);
        String content = templateEngine.process("payment-success", context);
        sendEmail(user.getEmail(), "ANPL Payment Successful", content);
    }

    @Override
    public void sendBadmintonRegistrationEmail(User registrant,
                                               Event event,
                                               List<BadmintonRegistrationEntry> entries) {
        if (!hasEmail(registrant) || entries == null || entries.isEmpty()) {
            return;
        }
        Context context = baseContext();
        context.setVariable("user", registrant);
        context.setVariable("event", event);
        context.setVariable("entries", entries);
        context.setVariable("logoImage", badmintonLogoUrl);
        context.setVariable("heroImage", badmintonBannerUrl);
        String content = templateEngine.process("badminton-registration", context);
        sendEmail(registrant.getEmail(), "Badminton Registration Received", content);
    }

    @Override
    public void sendBadmintonPartnerEmail(User partner,
                                          User registrant,
                                          Event event,
                                          List<BadmintonRegistrationEntry> entries) {
        if (partner == null || !hasEmail(partner) || entries == null || entries.isEmpty()) {
            return;
        }
        Context context = baseContext();
        context.setVariable("partner", partner);
        context.setVariable("registrant", registrant);
        context.setVariable("event", event);
        context.setVariable("entries", entries);
        context.setVariable("logoImage", badmintonLogoUrl);
        context.setVariable("heroImage", badmintonBannerUrl);
        String content = templateEngine.process("badminton-partner-notification", context);
        sendEmail(partner.getEmail(), "You have been registered for ANPL Badminton", content);
    }

    private boolean hasEmail(User user) {
        return user != null && user.getEmail() != null && !user.getEmail().isBlank();
    }

    private Context baseContext() {
        Context context = new Context();
        context.setVariable("brandName", brandName);
        context.setVariable("defaultLogoUrl", defaultLogoUrl);
        context.setVariable("defaultBannerUrl", defaultBannerUrl);
        context.setVariable("badmintonLogoUrl", badmintonLogoUrl);
        return context;
    }

    private void sendEmail(String to, String subject, String content) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name());

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true);
            helper.setFrom("noreply@anpl.com");

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }
} 