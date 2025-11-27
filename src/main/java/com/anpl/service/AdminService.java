package com.anpl.service;

import com.anpl.dto.AdminRegistrationDetailResponse;
import com.anpl.dto.AdminRegistrationSummaryResponse;
import com.anpl.exception.ResourceNotFoundException;
import com.anpl.model.*;
import com.anpl.repository.CricketPlayerSkillsRepository;
import com.anpl.repository.EventRegistrationRepository;
import com.anpl.repository.PlayerProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {
    private final EventRegistrationRepository registrationRepository;
    private final PlayerProfileRepository playerProfileRepository;
    private final CricketPlayerSkillsRepository cricketPlayerSkillsRepository;
    private final EventRegistrationService registrationService;

    @Transactional(readOnly = true)
    public List<AdminRegistrationSummaryResponse> getRegistrationSummaries(String eventType,
                                                                           RegistrationStatus status,
                                                                           boolean includeFailed) {
        return registrationRepository.findAll().stream()
                .filter(reg -> includeFailed || reg.getRegistrationStatus() != RegistrationStatus.FAILED)
                .filter(reg -> eventType == null ||
                        (reg.getEvent() != null &&
                                reg.getEvent().getEventType() != null &&
                                reg.getEvent().getEventType().equalsIgnoreCase(eventType)))
                .filter(reg -> status == null || reg.getRegistrationStatus() == status)
                .map(this::mapToSummary)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AdminRegistrationDetailResponse getRegistrationDetail(Long registrationId) {
        EventRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found"));

        return mapToDetail(registration);
    }

    @Transactional
    public void updateRegistrationStatus(Long registrationId,
                                         RegistrationStatus status) {
        registrationService.updateRegistrationStatus(registrationId, status);
    }

    @Transactional(readOnly = true)
    public byte[] exportRegistrationsToExcel() {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Registrations");

            Row headerRow = sheet.createRow(0);
            headerRow.createCell(0).setCellValue("Registration Number");
            headerRow.createCell(1).setCellValue("Full Name");
            headerRow.createCell(2).setCellValue("Email");
            headerRow.createCell(3).setCellValue("Phone");
            headerRow.createCell(4).setCellValue("Event");
            headerRow.createCell(5).setCellValue("Status");
            headerRow.createCell(6).setCellValue("Created At");

            List<EventRegistration> registrations = registrationRepository.findAll();
            int rowNum = 1;
            for (EventRegistration registration : registrations) {
                Row row = sheet.createRow(rowNum++);
                User user = registration.getUser();
                Event event = registration.getEvent();
                row.createCell(0).setCellValue(user != null ? user.getRegistrationNumber() : "");
                row.createCell(1).setCellValue(user != null ? user.getFullName() : "");
                row.createCell(2).setCellValue(user != null ? user.getEmail() : "");
                row.createCell(3).setCellValue(user != null ? user.getPhoneNumber() : "");
                row.createCell(4).setCellValue(event != null ? event.getName() : "");
                row.createCell(5).setCellValue(registration.getRegistrationStatus().name());
                row.createCell(6).setCellValue(registration.getCreatedAt() != null
                        ? registration.getCreatedAt().toString()
                        : "");
            }

            for (int i = 0; i < 7; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        } catch (Exception e) {
            log.error("Failed to export registrations", e);
            throw new RuntimeException("Failed to export registrations", e);
        }
    }

    private AdminRegistrationSummaryResponse mapToSummary(EventRegistration registration) {
        User user = registration.getUser();
        Event event = registration.getEvent();

        return AdminRegistrationSummaryResponse.builder()
                .registrationId(registration.getId())
                .registrationNumber(user != null ? user.getRegistrationNumber() : null)
                .registrationStatus(registration.getRegistrationStatus())
                .createdAt(registration.getCreatedAt())
                .updatedAt(registration.getUpdatedAt())
                .userId(user != null ? user.getId() : null)
                .fullName(user != null ? user.getFullName() : null)
                .email(user != null ? user.getEmail() : null)
                .phoneNumber(user != null ? user.getPhoneNumber() : null)
                .whatsappNumber(user != null ? user.getWhatsappNumber() : null)
                .block(user != null ? user.getBlock() : null)
                .houseNumber(user != null ? user.getHouseNumber() : null)
                .eventId(event != null ? event.getId() : null)
                .eventName(event != null ? event.getName() : null)
                .eventType(event != null ? event.getEventType() : null)
                .registrationCategory(registration.getRegistrationCategory())
                .jerseyNumber(registration.getJerseyNumber())
                .availableAllDays(registration.getAvailableAllDays())
                .aadhaarFrontPhoto(user != null ? user.getAadhaarFrontPhoto() : null)
                .aadhaarBackPhoto(user != null ? user.getAadhaarBackPhoto() : null)
                .playerPhoto(user != null ? user.getPlayerPhoto() : null)
                .build();
    }

    private AdminRegistrationDetailResponse mapToDetail(EventRegistration registration) {
        User user = registration.getUser();
        Event event = registration.getEvent();

        Optional<PlayerProfile> profileOpt = Optional.empty();
        Optional<CricketPlayerSkills> skillsOpt = Optional.empty();

        if (user != null && event != null) {
            profileOpt = playerProfileRepository.findByUserIdAndSportType(user.getId(), event.getEventType());
            skillsOpt = profileOpt.flatMap(profile -> cricketPlayerSkillsRepository.findByPlayerProfileId(profile.getId()));
        }

        PlayerProfile profile = profileOpt.orElse(null);
        CricketPlayerSkills skills = skillsOpt.orElse(null);

        return AdminRegistrationDetailResponse.builder()
                .registrationId(registration.getId())
                .registrationStatus(registration.getRegistrationStatus())
                .createdAt(registration.getCreatedAt())
                .updatedAt(registration.getUpdatedAt())
                .userId(user != null ? user.getId() : null)
                .fullName(user != null ? user.getFullName() : null)
                .fathersName(user != null ? user.getFathersName() : null)
                .dateOfBirth(user != null ? user.getDateOfBirth() : null)
                .gender(user != null ? user.getGender() : null)
                .bloodGroup(user != null ? user.getBloodGroup() : null)
                .email(user != null ? user.getEmail() : null)
                .phoneNumber(user != null ? user.getPhoneNumber() : null)
                .whatsappNumber(user != null ? user.getWhatsappNumber() : null)
                .block(user != null ? user.getBlock() : null)
                .houseNumber(user != null ? user.getHouseNumber() : null)
                .residentialAddress(user != null ? user.getResidentialAddress() : null)
                .aadhaarNumber(user != null ? user.getAadhaarNumber() : null)
                .aadhaarFrontPhoto(user != null ? user.getAadhaarFrontPhoto() : null)
                .aadhaarBackPhoto(user != null ? user.getAadhaarBackPhoto() : null)
                .playerPhoto(user != null ? user.getPlayerPhoto() : null)
                .preferredTshirtSize(user != null ? user.getPreferredTshirtSize() : null)
                .eventId(event != null ? event.getId() : null)
                .eventName(event != null ? event.getName() : null)
                .eventType(event != null ? event.getEventType() : null)
                .eventPrice(event != null ? event.getPrice() : null)
                .eventStartDate(event != null ? event.getEventStartDate() : null)
                .eventEndDate(event != null ? event.getEventEndDate() : null)
                .eventVenue(event != null ? event.getVenue() : null)
                .registrationCategory(registration.getRegistrationCategory())
                .teamRole(registration.getTeamRole())
                .jerseyNumber(registration.getJerseyNumber())
                .tshirtName(registration.getTshirtName())
                .availableAllDays(registration.getAvailableAllDays())
                .unavailableDates(parseUnavailableDates(registration.getUnavailableDates()))
                .termsAccepted(registration.getTermsAccepted())
                .termsAcceptedAt(registration.getTermsAcceptedAt())
                .playerProfileId(profile != null ? profile.getId() : null)
                .skillLevel(profile != null ? profile.getSkillLevel() : null)
                .yearsOfExperience(profile != null ? profile.getYearsOfExperience() : null)
                .sportsHistory(profile != null ? profile.getSportsHistory() : null)
                .achievements(profile != null ? profile.getAchievements() : null)
                .profileActive(profile != null ? profile.getIsActive() : null)
                .profileUpdatedAt(profile != null ? profile.getUpdatedAt() : null)
                .cricketSkillsId(skills != null ? skills.getId() : null)
                .primaryRole(skills != null ? skills.getPrimaryRole() : null)
                .wicketKeeper(skills != null ? skills.getIsWicketKeeper() : null)
                .allRounder(skills != null ? skills.getIsAllRounder() : null)
                .hasCaptainExperience(skills != null ? skills.getHasCaptaincyExperience() : null)
                .battingStyle(skills != null ? skills.getBattingStyle() : null)
                .battingPosition(skills != null ? skills.getBattingPosition() : null)
                .battingHand(skills != null ? mapStyleToHand(skills.getBattingStyle()) : null)
                .bowlingStyle(skills != null ? skills.getBowlingStyle() : null)
                .bowlingType(skills != null ? skills.getBowlingType() : null)
                .bowlingArm(skills != null ? skills.getBowlingArm() : null)
                .preferredFieldingPosition(skills != null ? skills.getPreferredFieldingPosition() : null)
                .matchesPlayed(skills != null ? skills.getMatchesPlayed() : null)
                .bestScore(skills != null ? skills.getBestScore() : null)
                .bestBowling(skills != null ? skills.getBestBowling() : null)
                .cricHeroesPhone(skills != null ? skills.getCricHeroesPhone() : null)
                .cricHeroesMatchesPlayed(skills != null ? skills.getCricHeroesMatchesPlayed() : null)
                .cricHeroesTotalRuns(skills != null ? skills.getCricHeroesTotalRuns() : null)
                .cricHeroesStrikeRate(skills != null ? skills.getCricHeroesStrikeRate() : null)
                .cricHeroesTotalWickets(skills != null ? skills.getCricHeroesTotalWickets() : null)
                .cricHeroesBowlingEconomy(skills != null ? skills.getCricHeroesBowlingEconomy() : null)
                .build();
    }

    private List<String> parseUnavailableDates(String storedValue) {
        if (storedValue == null || storedValue.isBlank()) {
            return Collections.emptyList();
        }
        return java.util.Arrays.stream(storedValue.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
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
} 