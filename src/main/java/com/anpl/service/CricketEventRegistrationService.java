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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Combined service for Cricket Event Registration
 * Handles both event registration and cricket-specific details in one transaction
 * Ensures all cricket details are collected BEFORE payment
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CricketEventRegistrationService {

    private static final String SPORT_CRICKET = "CRICKET";

    private final EventRegistrationRepository eventRegistrationRepository;
    private final PlayerProfileRepository playerProfileRepository;
    private final CricketPlayerSkillsRepository cricketPlayerSkillsRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;

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

        if (!SPORT_CRICKET.equalsIgnoreCase(event.getEventType())) {
            throw new IllegalArgumentException("This endpoint is only for cricket events");
        }

        validateAvailability(request, event);

        // Step 2: update user static information if provided
        User persistedUser = refreshUserDetails(user, request);

        // Step 3: Create or reuse existing event registration
        EventRegistration eventRegistration;
        Optional<EventRegistration> existingRegistrationOpt = eventRegistrationRepository
                .findByUserIdAndEventId(persistedUser.getId(), request.getEventId());

        if (existingRegistrationOpt.isPresent()) {
            eventRegistration = existingRegistrationOpt.get();
            if (RegistrationStatus.APPROVED.equals(eventRegistration.getRegistrationStatus())) {
                throw new ResourceAlreadyExistsException("You are already registered for this cricket event");
            }
            log.info("Reusing existing registration {} with status {}", eventRegistration.getId(),
                    eventRegistration.getRegistrationStatus());
        } else {
            eventRegistration = new EventRegistration();
            eventRegistration.setUser(persistedUser);
            eventRegistration.setEvent(event);
            eventRegistration.setCreatedAt(LocalDateTime.now());
            log.info("Creating new event registration");
        }

        eventRegistration.setRegistrationStatus(RegistrationStatus.PENDING);
        eventRegistration.setUpdatedAt(LocalDateTime.now());
        eventRegistration = eventRegistrationRepository.save(eventRegistration);

        // Step 4: Validate jersey number (unique per event)
        boolean jerseyChanged = eventRegistration.getJerseyNumber() == null
                || !eventRegistration.getJerseyNumber().equals(request.getLuckyNumber());
        if (jerseyChanged && eventRegistrationRepository.existsByEventIdAndJerseyNumber(
                event.getId(), request.getLuckyNumber())) {
            throw new ResourceAlreadyExistsException(
                    "Jersey number " + request.getLuckyNumber() + " is already taken for this event.");
        }

        // Step 5: Upsert player profile & skills
        PlayerProfile playerProfile = playerProfileRepository
                .findByUserIdAndSportType(persistedUser.getId(), SPORT_CRICKET)
                .orElseGet(() -> {
                    PlayerProfile profile = new PlayerProfile();
                    profile.setUser(persistedUser);
                    profile.setSportType(SPORT_CRICKET);
                    return profile;
                });
        playerProfile.setSkillLevel(request.getGameLevel());
        playerProfile.setSportsHistory(request.getSportsHistory().trim());
        playerProfile.setAchievements(request.getAchievements().trim());
        playerProfile.setIsActive(true);
        PlayerProfile savedProfile = playerProfileRepository.save(playerProfile);

        CricketPlayerSkills cricketSkills = cricketPlayerSkillsRepository
                .findByPlayerProfileId(savedProfile.getId())
                .orElseGet(() -> {
                    CricketPlayerSkills skills = new CricketPlayerSkills();
                    skills.setPlayerProfile(savedProfile);
                    return skills;
                });
        cricketSkills.setPlayerProfile(savedProfile);
        applySkillData(cricketSkills, request);
        CricketPlayerSkills savedSkills = cricketPlayerSkillsRepository.save(cricketSkills);

        // Step 6: Update event registration with event-specific fields
        eventRegistration.setTshirtName(request.getTshirtName());
        eventRegistration.setJerseyNumber(request.getLuckyNumber());
        eventRegistration.setRegistrationCategory(request.getRegistrationCategory());
        eventRegistration.setAvailableAllDays(request.getAvailableAllDays());
        if (Boolean.TRUE.equals(request.getAvailableAllDays())) {
            eventRegistration.setUnavailableDates(null);
        } else {
            eventRegistration.setUnavailableDates(serializeUnavailableDates(request.getUnavailableDates()));
        }
        eventRegistration.setTermsAccepted(Boolean.TRUE.equals(request.getTermsAccepted()));
        if (Boolean.TRUE.equals(request.getTermsAccepted())) {
            eventRegistration.setTermsAcceptedAt(LocalDateTime.now());
        }
        eventRegistration.setTeamRole(request.getCricketPreference().name());
        eventRegistration.setUpdatedAt(LocalDateTime.now());
        EventRegistration savedRegistration = eventRegistrationRepository.save(eventRegistration);

        log.info("Cricket registration completed successfully. Event Reg ID: {}", savedRegistration.getId());

        // Return response indicating ready for payment
        return CricketEventRegistrationResponse.builder()
                .eventRegistrationId(savedRegistration.getId())
                .playerProfileId(savedProfile.getId())
                .cricketProfileId(savedSkills.getId())
                .registrationNumber(persistedUser.getRegistrationNumber())
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
        return eventRegistrationRepository.findById(eventRegistrationId)
                .map(reg -> {
                    if (!Boolean.TRUE.equals(reg.getTermsAccepted())) {
                        return false;
                    }
                    PlayerProfile profile = playerProfileRepository
                            .findByUserIdAndSportType(reg.getUser().getId(), SPORT_CRICKET)
                            .orElse(null);
                    if (profile == null) {
                        return false;
                    }
                    return cricketPlayerSkillsRepository.findByPlayerProfileId(profile.getId()).isPresent();
                })
                .orElse(false);
    }

    /**
     * Get cricket registration details by event registration ID
     */
    @Transactional(readOnly = true)
    public CricketRegistrationResponse getCricketDetailsByEventRegistration(Long eventRegistrationId) {
        EventRegistration registration = eventRegistrationRepository.findById(eventRegistrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Event registration not found"));

        if (!SPORT_CRICKET.equalsIgnoreCase(registration.getEvent().getEventType())) {
            throw new IllegalArgumentException("Registration does not belong to a cricket event");
        }

        PlayerProfile profile = playerProfileRepository
                .findByUserIdAndSportType(registration.getUser().getId(), SPORT_CRICKET)
                .orElse(null);

        CricketPlayerSkills skills = (profile != null)
                ? cricketPlayerSkillsRepository.findByPlayerProfileId(profile.getId()).orElse(null)
                : null;

        return buildCricketResponse(registration.getUser(), registration, profile, skills);
    }

    @Transactional(readOnly = true)
    public CricketRegistrationResponse getCricketDetailsForEvent(User user, Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        if (!SPORT_CRICKET.equalsIgnoreCase(event.getEventType())) {
            throw new IllegalArgumentException("This endpoint is only for cricket events");
        }

        EventRegistration registration = eventRegistrationRepository
                .findByUserIdAndEventId(user.getId(), eventId)
                .orElseGet(() -> eventRegistrationRepository
                        .findFirstByUserIdAndEvent_EventTypeOrderByUpdatedAtDesc(user.getId(), SPORT_CRICKET)
                        .orElse(null));

        PlayerProfile profile = playerProfileRepository
                .findByUserIdAndSportType(user.getId(), SPORT_CRICKET)
                .orElse(null);

        CricketPlayerSkills skills = (profile != null)
                ? cricketPlayerSkillsRepository.findByPlayerProfileId(profile.getId()).orElse(null)
                : null;

        return buildCricketResponse(user, registration, profile, skills);
    }

    private CricketRegistrationResponse buildCricketResponse(User user,
                                                             EventRegistration registration,
                                                             PlayerProfile profile,
                                                             CricketPlayerSkills skills) {
        return CricketRegistrationResponse.builder()
                .eventRegistrationId(registration != null ? registration.getId() : null)
                .playerProfileId(profile != null ? profile.getId() : null)
                .cricketProfileId(skills != null ? skills.getId() : null)
                .gender(user.getGender())
                .preferredTshirtSize(user.getPreferredTshirtSize())
                .residentialAddress(user.getResidentialAddress())
                .whatsappNumber(user.getWhatsappNumber())
                .aadhaarFrontPhoto(user.getAadhaarFrontPhoto())
                .aadhaarBackPhoto(user.getAadhaarBackPhoto())
                .playerPhoto(user.getPlayerPhoto())
                .registrationCategory(registration != null ? registration.getRegistrationCategory() : null)
                .skillLevel(profile != null ? profile.getSkillLevel() : null)
                .sportsHistory(profile != null ? profile.getSportsHistory() : null)
                .achievements(profile != null ? profile.getAchievements() : null)
                .primaryRole(skills != null ? skills.getPrimaryRole() : null)
                .isWicketKeeper(skills != null ? skills.getIsWicketKeeper() : null)
                .hasCaptainExperience(skills != null ? skills.getHasCaptaincyExperience() : null)
                .battingStyle(skills != null ? skills.getBattingStyle() : null)
                .battingHand(skills != null ? mapStyleToHand(skills.getBattingStyle()) : null)
                .battingPosition(skills != null ? skills.getBattingPosition() : null)
                .bowlingStyle(skills != null ? skills.getBowlingStyle() : null)
                .bowlingType(skills != null ? skills.getBowlingType() : null)
                .bowlingPace(skills != null ? mapTypeToPace(skills.getBowlingType()) : null)
                .bowlingArm(skills != null ? skills.getBowlingArm() : null)
                .preferredFieldingPosition(skills != null ? skills.getPreferredFieldingPosition() : null)
                .tshirtName(registration != null ? registration.getTshirtName() : null)
                .jerseyNumber(registration != null ? registration.getJerseyNumber() : null)
                .cricketPreference(resolveCricketPreference(
                        registration != null ? registration.getTeamRole() : null,
                        skills != null ? skills.getPrimaryRole() : null))
                .availableAllDays(registration == null ? null : Boolean.TRUE.equals(registration.getAvailableAllDays()))
                .unavailableDates(registration != null
                        ? parseUnavailableDates(registration.getUnavailableDates())
                        : Collections.emptyList())
                .termsAccepted(registration != null ? registration.getTermsAccepted() : null)
                .termsAcceptedAt(registration != null ? registration.getTermsAcceptedAt() : null)
                .profileCreatedAt(profile != null ? profile.getCreatedAt() : null)
                .profileUpdatedAt(profile != null ? profile.getUpdatedAt() : null)
                .build();
    }

    private void applySkillData(CricketPlayerSkills skills, CricketEventRegistrationRequest request) {
        skills.setPrimaryRole(mapRole(request.getCricketPreference()));
        skills.setBattingStyle(mapBattingStyle(request.getBattingHand()));
        skills.setBowlingStyle(mapBowlingStyle(request.getBowlingArm()));
        skills.setBowlingType(mapBowlingType(request.getBowlingPace()));
        skills.setBowlingArm(request.getBowlingArm());
        skills.setBattingPosition(null);
        skills.setIsWicketKeeper(request.getIsWicketKeeper());
        skills.setHasCaptaincyExperience(request.getHasCaptainExperience());
    }

    private CricketRole mapRole(CricketPreference preference) {
        if (preference == null) {
            return CricketRole.ALL_ROUNDER;
        }
        return switch (preference) {
            case BATTING -> CricketRole.BATSMAN;
            case BOWLING -> CricketRole.BOWLER;
            case ALL_ROUNDER -> CricketRole.ALL_ROUNDER;
            case WICKET_KEEPER -> CricketRole.WICKET_KEEPER;
        };
    }

    private BattingStyle mapBattingStyle(HandPreference handPreference) {
        if (handPreference == null) {
            return BattingStyle.RIGHT_HANDED;
        }
        return switch (handPreference) {
            case LEFT -> BattingStyle.LEFT_HANDED;
            case RIGHT -> BattingStyle.RIGHT_HANDED;
            case BOTH -> BattingStyle.SWITCH_HITTER;
            default -> BattingStyle.RIGHT_HANDED;
        };
    }

    private BowlingStyle mapBowlingStyle(HandPreference handPreference) {
        if (handPreference == null) {
            return BowlingStyle.RIGHT_ARM;
        }
        return switch (handPreference) {
            case LEFT -> BowlingStyle.LEFT_ARM;
            case RIGHT, BOTH -> BowlingStyle.RIGHT_ARM;
            default -> BowlingStyle.NONE;
        };
    }

    private BowlingType mapBowlingType(BowlingPace pace) {
        if (pace == null) {
            return BowlingType.NONE;
        }
        return switch (pace) {
            case FAST -> BowlingType.FAST;
            case FAST_MEDIUM -> BowlingType.FAST_MEDIUM;
            case MEDIUM -> BowlingType.MEDIUM;
            case MEDIUM_SLOW -> BowlingType.MEDIUM_SLOW;
            case SLOW -> BowlingType.SLOW;
            case LEG_SPIN -> BowlingType.LEG_SPIN;
            case OFF_SPIN -> BowlingType.OFF_SPIN;
            case SPIN -> BowlingType.SPIN;
            case NOT_APPLICABLE -> BowlingType.NONE;
        };
    }

    private HandPreference mapStyleToHand(BattingStyle style) {
        if (style == null) {
            return HandPreference.RIGHT;
        }
        return switch (style) {
            case LEFT_HANDED -> HandPreference.LEFT;
            case RIGHT_HANDED -> HandPreference.RIGHT;
            case SWITCH_HITTER -> HandPreference.BOTH;
        };
    }

    private BowlingPace mapTypeToPace(BowlingType type) {
        if (type == null) {
            return BowlingPace.NOT_APPLICABLE;
        }
        return switch (type) {
            case FAST -> BowlingPace.FAST;
            case FAST_MEDIUM -> BowlingPace.FAST_MEDIUM;
            case MEDIUM -> BowlingPace.MEDIUM;
            case MEDIUM_SLOW -> BowlingPace.MEDIUM_SLOW;
            case SLOW -> BowlingPace.SLOW;
            case LEG_SPIN -> BowlingPace.LEG_SPIN;
            case OFF_SPIN -> BowlingPace.OFF_SPIN;
            case SPIN, CHINAMAN -> BowlingPace.SPIN;
            case NONE -> BowlingPace.NOT_APPLICABLE;
        };
    }

    private void validateAvailability(CricketEventRegistrationRequest request, Event event) {
        if (request.getAvailableAllDays() == null) {
            throw new IllegalArgumentException("Availability selection is required");
        }
        List<String> eventDateStrings = getEventDateStrings(event);

        if (Boolean.TRUE.equals(request.getAvailableAllDays())) {
            request.setUnavailableDates(Collections.emptyList());
            return;
        }

        if (request.getUnavailableDates() == null || request.getUnavailableDates().isEmpty()) {
            throw new IllegalArgumentException("Please select at least one date you are unavailable");
        }

        if (eventDateStrings.isEmpty()) {
            throw new IllegalArgumentException("Event dates are not configured. Please contact the organizers.");
        }

        for (String date : request.getUnavailableDates()) {
            if (!eventDateStrings.contains(date)) {
                throw new IllegalArgumentException("Selected date " + date + " is outside the event schedule");
            }
        }
    }

    private String serializeUnavailableDates(List<String> unavailableDates) {
        if (unavailableDates == null || unavailableDates.isEmpty()) {
            return null;
        }
        return unavailableDates.stream()
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .distinct()
                .collect(Collectors.joining(","));
    }

    private List<String> parseUnavailableDates(String storedValue) {
        if (storedValue == null || storedValue.isBlank()) {
            return Collections.emptyList();
        }
        return Arrays.stream(storedValue.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    private List<String> getEventDateStrings(Event event) {
        if (event.getEventStartDate() == null || event.getEventEndDate() == null) {
            return Collections.emptyList();
        }
        LocalDate start = event.getEventStartDate().toLocalDate();
        LocalDate end = event.getEventEndDate().toLocalDate();
        if (end.isBefore(start)) {
            return Collections.emptyList();
        }

        List<String> dates = new java.util.ArrayList<>();
        LocalDate cursor = start;
        while (!cursor.isAfter(end)) {
            dates.add(cursor.toString());
            cursor = cursor.plusDays(1);
        }
        return dates;
    }

    private CricketPreference resolveCricketPreference(String storedPreference, CricketRole primaryRole) {
        if (storedPreference != null) {
            try {
                return CricketPreference.valueOf(storedPreference);
            } catch (IllegalArgumentException ignored) {
            }
        }
        if (primaryRole == null) {
            return null;
        }
        return switch (primaryRole) {
            case BATSMAN -> CricketPreference.BATTING;
            case BOWLER -> CricketPreference.BOWLING;
            case ALL_ROUNDER -> CricketPreference.ALL_ROUNDER;
            case WICKET_KEEPER -> CricketPreference.WICKET_KEEPER;
        };
    }

    private User refreshUserDetails(User user, CricketEventRegistrationRequest request) {
        boolean updated = false;
        if (request.getGender() != null && user.getGender() != request.getGender()) {
            user.setGender(request.getGender());
            updated = true;
        }
        if (request.getTshirtSize() != null) {
            user.setPreferredTshirtSize(request.getTshirtSize());
            updated = true;
        }
        if (request.getResidentialAddress() != null) {
            user.setResidentialAddress(request.getResidentialAddress());
            updated = true;
        }
        if (request.getWhatsappNumber() != null) {
            user.setWhatsappNumber(request.getWhatsappNumber());
            updated = true;
        }
        if (request.getAadhaarFrontPhoto() != null) {
            user.setAadhaarFrontPhoto(request.getAadhaarFrontPhoto());
            updated = true;
        }
        if (request.getAadhaarBackPhoto() != null) {
            user.setAadhaarBackPhoto(request.getAadhaarBackPhoto());
            updated = true;
        }
        if (request.getPlayerPhoto() != null) {
            user.setPlayerPhoto(request.getPlayerPhoto());
            updated = true;
        }
        if (updated) {
            return userRepository.save(user);
        }
        return user;
    }
}

