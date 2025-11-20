package com.anpl.service;

import com.anpl.dto.CricketRegistrationRequest;
import com.anpl.dto.CricketRegistrationResponse;
import com.anpl.exception.ResourceAlreadyExistsException;
import com.anpl.exception.ResourceNotFoundException;
import com.anpl.model.CricketRegistration;
import com.anpl.model.EventRegistration;
import com.anpl.repository.CricketRegistrationRepository;
import com.anpl.repository.EventRegistrationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class CricketRegistrationService {

    private final CricketRegistrationRepository cricketRegistrationRepository;
    private final EventRegistrationRepository eventRegistrationRepository;

    @Transactional
    public CricketRegistrationResponse createCricketRegistration(CricketRegistrationRequest request) {
        // Check if event registration exists
        EventRegistration eventRegistration = eventRegistrationRepository
                .findById(request.getEventRegistrationId())
                .orElseThrow(() -> new ResourceNotFoundException("Event registration not found"));

        // Check if cricket registration already exists for this event registration
        if (cricketRegistrationRepository.existsByEventRegistrationId(request.getEventRegistrationId())) {
            throw new ResourceAlreadyExistsException("Cricket registration already exists for this event registration");
        }

        // Check if lucky number is already taken (optional: could be event-specific)
        if (cricketRegistrationRepository.existsByLuckyNumber(request.getLuckyNumber())) {
            throw new ResourceAlreadyExistsException("Lucky number " + request.getLuckyNumber() + " is already taken");
        }

        // Create cricket registration
        CricketRegistration cricketRegistration = new CricketRegistration();
        cricketRegistration.setEventRegistration(eventRegistration);
        cricketRegistration.setGender(request.getGender());
        cricketRegistration.setTshirtSize(request.getTshirtSize());
        cricketRegistration.setResidentialAddress(request.getResidentialAddress());
        cricketRegistration.setWhatsappNumber(request.getWhatsappNumber());
        cricketRegistration.setAadhaarFrontPhoto(request.getAadhaarFrontPhoto());
        cricketRegistration.setAadhaarBackPhoto(request.getAadhaarBackPhoto());
        cricketRegistration.setPlayerPhoto(request.getPlayerPhoto());
        cricketRegistration.setGameLevel(request.getGameLevel());
        cricketRegistration.setCricketPreference(request.getCricketPreference());
        cricketRegistration.setIsWicketKeeper(request.getIsWicketKeeper());
        cricketRegistration.setHasCaptainExperience(request.getHasCaptainExperience());
        cricketRegistration.setBattingHand(request.getBattingHand());
        cricketRegistration.setBowlingArm(request.getBowlingArm());
        cricketRegistration.setBowlingPace(request.getBowlingPace());
        cricketRegistration.setTshirtName(request.getTshirtName());
        cricketRegistration.setLuckyNumber(request.getLuckyNumber());
        cricketRegistration.setTermsAccepted(request.getTermsAccepted());
        cricketRegistration.setCreatedAt(LocalDateTime.now());
        cricketRegistration.setUpdatedAt(LocalDateTime.now());

        CricketRegistration saved = cricketRegistrationRepository.save(cricketRegistration);
        log.info("Cricket registration created for event registration ID: {}", request.getEventRegistrationId());

        return buildCricketRegistrationResponse(saved);
    }

    @Transactional(readOnly = true)
    public CricketRegistrationResponse getCricketRegistrationByEventRegistrationId(Long eventRegistrationId) {
        CricketRegistration cricketRegistration = cricketRegistrationRepository
                .findByEventRegistrationId(eventRegistrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Cricket registration not found"));

        return buildCricketRegistrationResponse(cricketRegistration);
    }

    @Transactional(readOnly = true)
    public CricketRegistrationResponse getCricketRegistrationById(Long id) {
        CricketRegistration cricketRegistration = cricketRegistrationRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cricket registration not found"));

        return buildCricketRegistrationResponse(cricketRegistration);
    }

    @Transactional
    public CricketRegistrationResponse updateCricketRegistration(Long id, CricketRegistrationRequest request) {
        CricketRegistration cricketRegistration = cricketRegistrationRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cricket registration not found"));

        // Check if lucky number is taken by someone else
        if (!cricketRegistration.getLuckyNumber().equals(request.getLuckyNumber()) &&
            cricketRegistrationRepository.existsByLuckyNumber(request.getLuckyNumber())) {
            throw new ResourceAlreadyExistsException("Lucky number " + request.getLuckyNumber() + " is already taken");
        }

        // Update fields
        cricketRegistration.setGender(request.getGender());
        cricketRegistration.setTshirtSize(request.getTshirtSize());
        cricketRegistration.setResidentialAddress(request.getResidentialAddress());
        cricketRegistration.setWhatsappNumber(request.getWhatsappNumber());
        cricketRegistration.setAadhaarFrontPhoto(request.getAadhaarFrontPhoto());
        cricketRegistration.setAadhaarBackPhoto(request.getAadhaarBackPhoto());
        cricketRegistration.setPlayerPhoto(request.getPlayerPhoto());
        cricketRegistration.setGameLevel(request.getGameLevel());
        cricketRegistration.setCricketPreference(request.getCricketPreference());
        cricketRegistration.setIsWicketKeeper(request.getIsWicketKeeper());
        cricketRegistration.setHasCaptainExperience(request.getHasCaptainExperience());
        cricketRegistration.setBattingHand(request.getBattingHand());
        cricketRegistration.setBowlingArm(request.getBowlingArm());
        cricketRegistration.setBowlingPace(request.getBowlingPace());
        cricketRegistration.setTshirtName(request.getTshirtName());
        cricketRegistration.setLuckyNumber(request.getLuckyNumber());
        cricketRegistration.setTermsAccepted(request.getTermsAccepted());
        cricketRegistration.setUpdatedAt(LocalDateTime.now());

        CricketRegistration updated = cricketRegistrationRepository.save(cricketRegistration);
        log.info("Cricket registration updated: {}", id);

        return buildCricketRegistrationResponse(updated);
    }

    private CricketRegistrationResponse buildCricketRegistrationResponse(CricketRegistration registration) {
        return CricketRegistrationResponse.builder()
                .id(registration.getId())
                .eventRegistrationId(registration.getEventRegistration().getId())
                .gender(registration.getGender())
                .tshirtSize(registration.getTshirtSize())
                .residentialAddress(registration.getResidentialAddress())
                .whatsappNumber(registration.getWhatsappNumber())
                .aadhaarFrontPhoto(registration.getAadhaarFrontPhoto())
                .aadhaarBackPhoto(registration.getAadhaarBackPhoto())
                .playerPhoto(registration.getPlayerPhoto())
                .gameLevel(registration.getGameLevel())
                .cricketPreference(registration.getCricketPreference())
                .isWicketKeeper(registration.getIsWicketKeeper())
                .hasCaptainExperience(registration.getHasCaptainExperience())
                .battingHand(registration.getBattingHand())
                .bowlingArm(registration.getBowlingArm())
                .bowlingPace(registration.getBowlingPace())
                .tshirtName(registration.getTshirtName())
                .luckyNumber(registration.getLuckyNumber())
                .termsAccepted(registration.getTermsAccepted())
                .createdAt(registration.getCreatedAt())
                .updatedAt(registration.getUpdatedAt())
                .build();
    }
}

