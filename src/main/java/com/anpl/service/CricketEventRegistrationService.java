package com.anpl.service;

import com.anpl.dto.*;
import com.anpl.exception.ResourceAlreadyExistsException;
import com.anpl.exception.ResourceNotFoundException;
import com.anpl.model.*;
import com.anpl.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Combined service for Cricket Event Registration
 * Handles both event registration and cricket-specific details in one transaction
 * Ensures all cricket details are collected BEFORE payment
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CricketEventRegistrationService {

    private final EventRegistrationRepository eventRegistrationRepository;
    private final CricketRegistrationRepository cricketRegistrationRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final EmailService emailService;

    /**
     * Complete cricket event registration process
     * This method:
     * 1. Creates or retrieves event registration
     * 2. Creates cricket-specific registration with all mandatory fields
     * 3. Validates all data
     * 4. Returns response indicating ready for payment
     */
    @Transactional
    public CricketEventRegistrationResponse registerForCricketEvent(
            User user, CricketEventRegistrationRequest request) {
        
        log.info("Starting cricket event registration for user: {} and event: {}", 
                 user.getId(), request.getEventId());

        // Step 1: Verify event exists and is a cricket event
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        if (!event.getName().toLowerCase().contains("cricket")) {
            throw new IllegalArgumentException("This endpoint is only for cricket events");
        }

        // Step 2: Check for existing approved registration
        Optional<EventRegistration> existingApprovedReg = eventRegistrationRepository
                .findByUserIdAndEventIdAndRegistrationStatus(
                        user.getId(), request.getEventId(), RegistrationStatus.APPROVED);

        if (existingApprovedReg.isPresent()) {
            throw new ResourceAlreadyExistsException("You are already registered for this cricket event");
        }

        // Step 3: Create or get event registration
        EventRegistration eventRegistration;
        Optional<EventRegistration> existingPendingReg = eventRegistrationRepository
                .findByUserIdAndEventIdAndRegistrationStatus(
                        user.getId(), request.getEventId(), RegistrationStatus.PENDING);

        if (existingPendingReg.isPresent()) {
            eventRegistration = existingPendingReg.get();
            log.info("Found existing pending registration: {}", eventRegistration.getId());
        } else {
            eventRegistration = new EventRegistration();
            eventRegistration.setUser(user);
            eventRegistration.setEvent(event);
            eventRegistration.setRegistrationStatus(RegistrationStatus.PENDING);
            eventRegistration.setCreatedAt(LocalDateTime.now());
            eventRegistration.setUpdatedAt(LocalDateTime.now());
            eventRegistration = eventRegistrationRepository.save(eventRegistration);
            log.info("Created new event registration: {}", eventRegistration.getId());
        }

        // Step 4: Check if cricket registration already exists
        Optional<CricketRegistration> existingCricketReg = cricketRegistrationRepository
                .findByEventRegistrationId(eventRegistration.getId());

        if (existingCricketReg.isPresent()) {
            throw new ResourceAlreadyExistsException(
                    "Cricket registration details already submitted. Please proceed to payment.");
        }

        // Step 5: Validate lucky number availability
        if (cricketRegistrationRepository.existsByLuckyNumber(request.getLuckyNumber())) {
            throw new ResourceAlreadyExistsException(
                    "Lucky number " + request.getLuckyNumber() + " is already taken. Please choose another.");
        }

        // Step 6: Create cricket registration with all details
        CricketRegistration cricketRegistration = new CricketRegistration();
        cricketRegistration.setEventRegistration(eventRegistration);
        
        // Personal Info
        cricketRegistration.setGender(request.getGender());
        cricketRegistration.setTshirtSize(request.getTshirtSize());
        cricketRegistration.setResidentialAddress(request.getResidentialAddress());
        cricketRegistration.setWhatsappNumber(request.getWhatsappNumber());
        
        // Documents
        cricketRegistration.setAadhaarFrontPhoto(request.getAadhaarFrontPhoto());
        cricketRegistration.setAadhaarBackPhoto(request.getAadhaarBackPhoto());
        cricketRegistration.setPlayerPhoto(request.getPlayerPhoto());
        
        // Cricket Skills
        cricketRegistration.setGameLevel(request.getGameLevel());
        cricketRegistration.setCricketPreference(request.getCricketPreference());
        cricketRegistration.setIsWicketKeeper(request.getIsWicketKeeper());
        cricketRegistration.setHasCaptainExperience(request.getHasCaptainExperience());
        cricketRegistration.setBattingHand(request.getBattingHand());
        cricketRegistration.setBowlingArm(request.getBowlingArm());
        cricketRegistration.setBowlingPace(request.getBowlingPace());
        
        // T-Shirt Details
        cricketRegistration.setTshirtName(request.getTshirtName());
        cricketRegistration.setLuckyNumber(request.getLuckyNumber());
        
        // Terms
        cricketRegistration.setTermsAccepted(request.getTermsAccepted());
        
        cricketRegistration.setCreatedAt(LocalDateTime.now());
        cricketRegistration.setUpdatedAt(LocalDateTime.now());

        CricketRegistration savedCricketReg = cricketRegistrationRepository.save(cricketRegistration);
        
        log.info("Cricket registration completed successfully. Event Reg ID: {}, Cricket Reg ID: {}", 
                 eventRegistration.getId(), savedCricketReg.getId());

        // Step 7: Send confirmation email (optional)
        // emailService.sendCricketRegistrationConfirmation(user, eventRegistration, savedCricketReg);

        // Step 8: Return response indicating ready for payment
        return CricketEventRegistrationResponse.builder()
                .eventRegistrationId(eventRegistration.getId())
                .cricketRegistrationId(savedCricketReg.getId())
                .registrationNumber(user.getRegistrationNumber())
                .eventName(event.getName())
                .eventPrice(event.getPrice())
                .readyForPayment(true)
                .message("Cricket registration completed successfully. You can now proceed to payment.")
                .build();
    }

    /**
     * Check if cricket registration is complete for an event registration
     * Used to verify before allowing payment
     */
    @Transactional(readOnly = true)
    public boolean isCricketRegistrationComplete(Long eventRegistrationId) {
        return cricketRegistrationRepository.existsByEventRegistrationId(eventRegistrationId);
    }

    /**
     * Get cricket registration details by event registration ID
     */
    @Transactional(readOnly = true)
    public CricketRegistrationResponse getCricketDetailsByEventRegistration(Long eventRegistrationId) {
        CricketRegistration cricketReg = cricketRegistrationRepository
                .findByEventRegistrationId(eventRegistrationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Cricket registration not found. Please complete cricket registration before payment."));

        return buildCricketResponse(cricketReg);
    }

    private CricketRegistrationResponse buildCricketResponse(CricketRegistration reg) {
        return CricketRegistrationResponse.builder()
                .id(reg.getId())
                .eventRegistrationId(reg.getEventRegistration().getId())
                .gender(reg.getGender())
                .tshirtSize(reg.getTshirtSize())
                .residentialAddress(reg.getResidentialAddress())
                .whatsappNumber(reg.getWhatsappNumber())
                .aadhaarFrontPhoto(reg.getAadhaarFrontPhoto())
                .aadhaarBackPhoto(reg.getAadhaarBackPhoto())
                .playerPhoto(reg.getPlayerPhoto())
                .gameLevel(reg.getGameLevel())
                .cricketPreference(reg.getCricketPreference())
                .isWicketKeeper(reg.getIsWicketKeeper())
                .hasCaptainExperience(reg.getHasCaptainExperience())
                .battingHand(reg.getBattingHand())
                .bowlingArm(reg.getBowlingArm())
                .bowlingPace(reg.getBowlingPace())
                .tshirtName(reg.getTshirtName())
                .luckyNumber(reg.getLuckyNumber())
                .termsAccepted(reg.getTermsAccepted())
                .createdAt(reg.getCreatedAt())
                .updatedAt(reg.getUpdatedAt())
                .build();
    }
}

