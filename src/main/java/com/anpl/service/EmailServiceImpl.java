package com.anpl.service;

import com.anpl.model.User;
import com.anpl.model.EventRegistration;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {
    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Override
    public void sendWelcomeEmail(User user) {
        Context context = new Context();
        context.setVariable("user", user);
        String content = templateEngine.process("welcome-email", context);
        sendEmail(user.getEmail(), "Welcome to ANPL Registration", content);
    }

    @Override
    public void sendEventRegistrationEmail(User user, EventRegistration registration) {
        Context context = new Context();
        context.setVariable("user", user);
        context.setVariable("registration", registration);
        String content = templateEngine.process("event-registration", context);
        sendEmail(user.getEmail(), "ANPL Event Registration Confirmation", content);
    }

    @Override
    public void sendRegistrationStatusUpdateEmail(User user, EventRegistration registration) {
        Context context = new Context();
        context.setVariable("user", user);
        context.setVariable("registration", registration);
        String content = templateEngine.process("registration-status-update", context);
        sendEmail(user.getEmail(), "ANPL Registration Status Update", content);
    }

    @Override
    public void sendPasswordResetEmail(User user, String resetToken) {
        Context context = new Context();
        context.setVariable("user", user);
        context.setVariable("resetToken", resetToken);
        String content = templateEngine.process("password-reset", context);
        sendEmail(user.getEmail(), "ANPL Password Reset Request", content);
    }

    @Override
    public void sendPaymentSuccessEmail(User user) {
        Context context = new Context();
        context.setVariable("user", user);
        String content = templateEngine.process("payment-success", context);
        sendEmail(user.getEmail(), "ANPL Payment Successful", content);
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