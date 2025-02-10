package com.anpl.service;

import com.anpl.dto.EventRegistrationRequest;
import com.anpl.dto.EventRegistrationResponse;
import com.anpl.model.EventRegistration;
import com.anpl.model.User;
import com.anpl.model.Event;
import com.anpl.model.RegistrationStatus;
import com.anpl.model.PaymentStatus;
import com.anpl.exception.ResourceAlreadyExistsException;
import com.anpl.exception.ResourceNotFoundException;
import com.anpl.repository.EventRegistrationRepository;
import com.anpl.repository.UserRepository;
import com.anpl.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventRegistrationService {
    private final EventRegistrationRepository eventRegistrationRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final EmailService emailService;

    @Transactional
    public EventRegistrationResponse registerForEvent(Long userId, Long eventId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        // Check if user is already registered for this event
        boolean alreadyRegistered = eventRegistrationRepository
                .findByUserIdAndEventId(userId, eventId)
                .isPresent();
                
        if (alreadyRegistered) {
            throw new ResourceAlreadyExistsException("Already registered for this event");
        }

        EventRegistration registration = new EventRegistration();
        registration.setUser(user);
        registration.setEvent(event);
        registration.setRegistrationStatus(RegistrationStatus.PENDING);
        registration.setPaymentStatus(PaymentStatus.PENDING);
        registration.setCreatedAt(LocalDateTime.now());

        EventRegistration savedRegistration = eventRegistrationRepository.save(registration);
        
        // Send registration confirmation email
        emailService.sendEventRegistrationEmail(user, savedRegistration);

        return buildEventRegistrationResponse(savedRegistration);
    }

    public List<EventRegistration> getUserRegistrations(Long userId) {
        return eventRegistrationRepository.findByUserId(userId);
    }

    public EventRegistrationResponse getRegistrationById(Long registrationId) {
        EventRegistration registration = eventRegistrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found"));
        return buildEventRegistrationResponse(registration);
    }

    @Transactional
    public EventRegistrationResponse updateRegistrationStatus(Long registrationId, RegistrationStatus status) {
        EventRegistration registration = eventRegistrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found"));
        
        registration.setRegistrationStatus(status);
        registration.setUpdatedAt(LocalDateTime.now());
        EventRegistration updatedRegistration = eventRegistrationRepository.save(registration);
        
        emailService.sendRegistrationStatusUpdateEmail(updatedRegistration.getUser(), updatedRegistration);
        
        return buildEventRegistrationResponse(updatedRegistration);
    }

    public EventRegistrationResponse buildEventRegistrationResponse(EventRegistration registration) {
        User user = registration.getUser();
        return EventRegistrationResponse.builder()
                .id(registration.getId())
                .registrationNumber(user.getRegistrationNumber())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .block(user.getBlock())
                .tshirtSize(user.getTshirtSize())
                .eventYear(registration.getEvent().getYear())
                .registrationStatus(registration.getRegistrationStatus())
                .paymentStatus(registration.getPaymentStatus())
                .registrationDate(registration.getCreatedAt())
                .build();
    }

    @Transactional
    public EventRegistrationResponse createRegistration(User user, EventRegistrationRequest request) {
        return registerForEvent(user.getId(), request.getEventId());
    }
} 