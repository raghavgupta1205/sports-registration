package com.anpl.service;

import com.anpl.dto.BadmintonCategoryOption;
import com.anpl.dto.BadmintonEventRegistrationRequest;
import com.anpl.dto.BadmintonEventRegistrationResponse;
import com.anpl.dto.BadmintonOrderResponse;
import com.anpl.dto.BadmintonPartnerInfo;
import com.anpl.dto.BadmintonPaymentVerificationRequest;
import com.anpl.dto.BadmintonRegistrationEntryRequest;
import com.anpl.dto.BadmintonRegistrationEntryResponse;
import com.anpl.exception.ResourceNotFoundException;
import com.anpl.model.BadmintonCategory;
import com.anpl.model.BadmintonCategoryType;
import com.anpl.model.BadmintonRegistrationBundle;
import com.anpl.model.BadmintonRegistrationEntry;
import com.anpl.model.Event;
import com.anpl.model.FamilyRelationMapping;
import com.anpl.model.Gender;
import com.anpl.model.RegistrationStatus;
import com.anpl.model.User;
import com.anpl.repository.BadmintonCategoryRepository;
import com.anpl.repository.BadmintonRegistrationBundleRepository;
import com.anpl.repository.BadmintonRegistrationEntryRepository;
import com.anpl.repository.EventRepository;
import com.anpl.repository.UserRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BadmintonRegistrationService {

    private final BadmintonCategoryRepository categoryRepository;
    private final BadmintonRegistrationBundleRepository bundleRepository;
    private final BadmintonRegistrationEntryRepository entryRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final RazorpayClient razorpayClient;

    private static final int PRICE_PER_PLAYER = 800;

    @PostConstruct
    public void seedCategories() {
        if (categoryRepository.count() > 0) {
            return;
        }
        List<BadmintonCategory> seeds = new ArrayList<>();
        addCategory(seeds, "Boys Single U11", BadmintonCategoryType.SOLO, "U11");
        addCategory(seeds, "Boys Double U11", BadmintonCategoryType.DOUBLE, "U11");
        addCategory(seeds, "Boys Single U15", BadmintonCategoryType.SOLO, "U15");
        addCategory(seeds, "Boys Double U15", BadmintonCategoryType.DOUBLE, "U15");
        addCategory(seeds, "Boys Single U19", BadmintonCategoryType.SOLO, "U19");
        addCategory(seeds, "Boys Double U19", BadmintonCategoryType.DOUBLE, "U19");
        addCategory(seeds, "Mens Single 20+", BadmintonCategoryType.SOLO, "20+");
        addCategory(seeds, "Mens Single 35+", BadmintonCategoryType.SOLO, "35+");
        addCategory(seeds, "Men Single 50+", BadmintonCategoryType.SOLO, "50+");
        addCategory(seeds, "Men's Double Event", BadmintonCategoryType.DOUBLE, "Open");
        addCategory(seeds, "Mens Lucky Double Event", BadmintonCategoryType.DOUBLE, "Open");
        addCategory(seeds, "Women Single 35+", BadmintonCategoryType.SOLO, "35+");
        addCategory(seeds, "Womens Double 35+", BadmintonCategoryType.DOUBLE, "35+");
        addCategory(seeds, "Husband & Wife", BadmintonCategoryType.FAMILY, "Open");
        addCategory(seeds, "Father Daughter", BadmintonCategoryType.FAMILY, "Open");
        addCategory(seeds, "Mother Daughter", BadmintonCategoryType.FAMILY, "Open");
        addCategory(seeds, "Mother Son", BadmintonCategoryType.FAMILY, "Open");
        addCategory(seeds, "Saas Bahu", BadmintonCategoryType.FAMILY, "Open");
        addCategory(seeds, "Father Son 15+", BadmintonCategoryType.FAMILY, "15+");
        addCategory(seeds, "Father Son U15", BadmintonCategoryType.FAMILY, "U15");
        addCategory(seeds, "Girls Single U11", BadmintonCategoryType.SOLO, "U11");
        addCategory(seeds, "Girls Double U11", BadmintonCategoryType.DOUBLE, "U11");
        addCategory(seeds, "Girls Single U15", BadmintonCategoryType.SOLO, "U15");
        addCategory(seeds, "Girls Double U15", BadmintonCategoryType.DOUBLE, "U15");
        addCategory(seeds, "Girls Single U19", BadmintonCategoryType.SOLO, "U19");
        addCategory(seeds, "Girls Double U19", BadmintonCategoryType.DOUBLE, "U19");

        categoryRepository.saveAll(seeds);
    }

    private void addCategory(List<BadmintonCategory> seeds, String name, BadmintonCategoryType type, String ageLimit) {
        BadmintonCategory category = new BadmintonCategory();
        category.setName(name);
        category.setCategoryType(type);
        category.setPricePerPlayer(PRICE_PER_PLAYER);
        category.setAgeLimit(ageLimit);
        seeds.add(category);
    }

    @Transactional(readOnly = true)
    public List<BadmintonCategoryOption> getCategories() {
        return categoryRepository.findAllByActiveTrueOrderByDisplayOrderAscNameAsc().stream()
                .map(cat -> BadmintonCategoryOption.builder()
                        .id(cat.getId())
                        .name(cat.getName())
                        .categoryType(cat.getCategoryType())
                        .pricePerPlayer(cat.getPricePerPlayer())
                        .ageLimit(cat.getAgeLimit())
                        .description(cat.getDescription())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public BadmintonEventRegistrationResponse createBundle(User user, BadmintonEventRegistrationRequest request) {
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        if (!"BADMINTON".equalsIgnoreCase(event.getEventType())) {
            throw new IllegalArgumentException("Selected event is not a badminton event");
        }

        if (!Boolean.TRUE.equals(request.getTermsAccepted())) {
            throw new IllegalArgumentException("Terms must be accepted");
        }

        User currentUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (StringUtils.hasText(request.getPlayerPhoto())) {
            currentUser.setPlayerPhoto(request.getPlayerPhoto());
            userRepository.save(currentUser);
        }

        BadmintonRegistrationBundle bundle = new BadmintonRegistrationBundle();
        bundle.setUser(currentUser);
        bundle.setEvent(event);
        bundle.setTermsAccepted(true);
        bundle = bundleRepository.save(bundle);

        int totalAmount = 0;

        for (BadmintonRegistrationEntryRequest entryRequest : request.getEntries()) {
            BadmintonCategory category = categoryRepository.findById(entryRequest.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

            validateCategoryForUser(category, currentUser, "Player");

            BadmintonRegistrationEntry entry = new BadmintonRegistrationEntry();
            bundle.addEntry(entry);
            entry.setCategory(category);
            entry.setCategoryType(category.getCategoryType());
            entry.setPricePerPlayer(category.getPricePerPlayer());

            switch (category.getCategoryType()) {
                case SOLO -> handleSoloEntry(entry);
                case DOUBLE -> {
                    BadmintonPartnerInfo partnerInfo = requireDoublePartner(entryRequest.getPartnerInfo());
                    User partner = fetchPartnerUser(partnerInfo);
                    ensureAadhaarDocuments(partner, "Partner");
                    validateCategoryForUser(category, partner, "Partner");
                    handleDoubleEntry(entry, partner);
                }
                case FAMILY -> {
                    FamilyRelationMapping mapping = resolveFamilyRelation(category.getName(), entryRequest.getSelfRelation());
                    BadmintonPartnerInfo partnerInfo = requireFamilyPartner(entryRequest.getPartnerInfo());
                    User partner = fetchPartnerUser(partnerInfo);
                    ensureAadhaarDocuments(partner, "Partner");
                    validateFamilyRelationGenders(mapping, currentUser, partner);
                    handleFamilyEntry(entry, mapping, partner);
                }
                default -> throw new IllegalArgumentException("Unsupported category type");
            }

            totalAmount += calculateEntryAmount(category.getCategoryType(), category.getPricePerPlayer());
        }

        if (request.getTotalAmount() != null && !request.getTotalAmount().equals(totalAmount)) {
            throw new IllegalArgumentException("Total amount mismatch");
        }

        bundle.setTotalAmount(totalAmount);
        BadmintonRegistrationBundle savedBundle = bundleRepository.saveAndFlush(bundle);

        List<BadmintonRegistrationEntryResponse> entryResponses = savedBundle.getEntries().stream()
                .map(this::mapEntryToResponse)
                .collect(Collectors.toList());

        return BadmintonEventRegistrationResponse.builder()
                .bundleRegistrationId(savedBundle.getId())
                .eventId(event.getId())
                .eventName(event.getName())
                .playerFullName(currentUser.getFullName())
                .playerPhoto(currentUser.getPlayerPhoto())
                .totalEntries(savedBundle.getEntries().size())
                .totalAmount(savedBundle.getTotalAmount())
                .readyForPayment(true)
                .entries(entryResponses)
                .build();
    }

    private void handleSoloEntry(BadmintonRegistrationEntry entry) {
        // no-op: solo entries only need base fields
    }

    private void handleDoubleEntry(BadmintonRegistrationEntry entry,
                                   User partner) {
        entry.setPartnerUserId(partner.getId());
        entry.setPartnerFullName(partner.getFullName());
        entry.setPartnerAge(calculateAge(partner.getDateOfBirth()));
        entry.setPartnerContact(partner.getPhoneNumber());
    }

    private void handleFamilyEntry(BadmintonRegistrationEntry entry,
                                   FamilyRelationMapping mapping,
                                   User partner) {
        entry.setSelfRelation(mapping.getSelfRelation());
        entry.setPartnerRelation(mapping.getPartnerRelation());
        entry.setPartnerUserId(partner.getId());
        entry.setPartnerFullName(partner.getFullName());
        entry.setPartnerAge(calculateAge(partner.getDateOfBirth()));
        entry.setPartnerContact(partner.getPhoneNumber());
    }

    private BadmintonPartnerInfo requireDoublePartner(BadmintonPartnerInfo partnerInfo) {
        if (partnerInfo == null || partnerInfo.getUserId() == null) {
            throw new IllegalArgumentException("Partner user is required for double categories");
        }
        return partnerInfo;
    }

    private BadmintonPartnerInfo requireFamilyPartner(BadmintonPartnerInfo partnerInfo) {
        if (partnerInfo == null || partnerInfo.getUserId() == null) {
            throw new IllegalArgumentException("Partner user is required for family categories");
        }
        return partnerInfo;
    }

    private FamilyRelationMapping resolveFamilyRelation(String categoryName, String selfRelation) {
        FamilyRelationMapping mapping = FamilyRelationMapping.forCategoryAndSelf(categoryName, selfRelation);
        if (mapping == null) {
            throw new IllegalArgumentException("Invalid relation selected for " + categoryName);
        }
        return mapping;
    }

    private int calculateEntryAmount(BadmintonCategoryType type, int pricePerPlayer) {
        return switch (type) {
            case SOLO -> pricePerPlayer;
            case DOUBLE, FAMILY -> pricePerPlayer * 2;
        };
    }

    @Transactional(readOnly = true)
    public BadmintonEventRegistrationResponse getBundle(Long bundleId) {
        BadmintonRegistrationBundle bundle = bundleRepository.findById(bundleId)
                .orElseThrow(() -> new ResourceNotFoundException("Bundle not found"));

        List<BadmintonRegistrationEntryResponse> responses = bundle.getEntries().stream()
                .map(this::mapEntryToResponse)
                .collect(Collectors.toList());

        return BadmintonEventRegistrationResponse.builder()
                .bundleRegistrationId(bundle.getId())
                .eventId(bundle.getEvent().getId())
                .eventName(bundle.getEvent().getName())
                .playerFullName(bundle.getUser().getFullName())
                .playerPhoto(bundle.getUser().getPlayerPhoto())
                .totalEntries(bundle.getEntries().size())
                .totalAmount(bundle.getTotalAmount())
                .entries(responses)
                .readyForPayment(bundle.getBundleStatus() == RegistrationStatus.PENDING)
                .paymentOrderId(bundle.getPaymentOrderId())
                .build();
    }

    @Transactional
    public BadmintonOrderResponse createOrder(User user, Long bundleId) throws RazorpayException {
        BadmintonRegistrationBundle bundle = bundleRepository.findById(bundleId)
                .orElseThrow(() -> new ResourceNotFoundException("Bundle not found"));

        if (!bundle.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("You can only pay for your own registrations");
        }

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", bundle.getTotalAmount() * 100);
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "badminton_bundle_" + bundle.getId());

        Order order = razorpayClient.orders.create(orderRequest);
        bundle.setPaymentOrderId(order.get("id"));
        bundleRepository.save(bundle);

        return BadmintonOrderResponse.builder()
                .bundleId(bundle.getId())
                .orderId(order.get("id"))
                .amount(bundle.getTotalAmount())
                .currency("INR")
                .build();
    }

    @Transactional
    public void verifyPayment(BadmintonPaymentVerificationRequest request) throws RazorpayException {
        BadmintonRegistrationBundle bundle = bundleRepository.findById(request.getBundleId())
                .orElseThrow(() -> new ResourceNotFoundException("Bundle not found"));

        JSONObject attributes = new JSONObject();
        attributes.put("razorpay_order_id", request.getOrderId());
        attributes.put("razorpay_payment_id", request.getPaymentId());
        attributes.put("razorpay_signature", request.getSignature());

        Utils.verifyPaymentSignature(attributes, request.getSignature());

        Order order = razorpayClient.orders.fetch(request.getOrderId());
        if (!"paid".equals(order.get("status"))) {
            throw new IllegalArgumentException("Payment not completed");
        }

        bundle.setBundleStatus(RegistrationStatus.APPROVED);
        bundle.setPaymentOrderId(request.getOrderId());
        bundle.setPaymentReference(request.getPaymentId());
        bundleRepository.save(bundle);

        bundle.getEntries().forEach(entry -> {
            entry.setEntryStatus(RegistrationStatus.APPROVED);
            entryRepository.save(entry);
        });
    }

    private Integer calculateAge(LocalDate dob) {
        if (dob == null) {
            return null;
        }
        return Period.between(dob, LocalDate.now()).getYears();
    }

    private BadmintonRegistrationEntryResponse mapEntryToResponse(BadmintonRegistrationEntry entry) {
        BadmintonPartnerInfo partnerInfo = null;
        if (entry.getPartnerFullName() != null) {
            partnerInfo = new BadmintonPartnerInfo();
            partnerInfo.setUserId(entry.getPartnerUserId());
            partnerInfo.setFullName(entry.getPartnerFullName());
            partnerInfo.setAge(entry.getPartnerAge());
            partnerInfo.setContactNumber(entry.getPartnerContact());
        }

        return BadmintonRegistrationEntryResponse.builder()
                .entryId(entry.getId())
                .categoryId(entry.getCategory().getId())
                .categoryName(entry.getCategory().getName())
                .categoryType(entry.getCategoryType())
                .pricePerPlayer(entry.getPricePerPlayer())
                .partnerInfo(partnerInfo)
                .selfRelation(entry.getSelfRelation())
                .partnerRelation(entry.getPartnerRelation())
                .build();
    }

    private User fetchPartnerUser(BadmintonPartnerInfo partnerInfo) {
        return userRepository.findById(partnerInfo.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Partner user not found"));
    }

    private void validateCategoryForUser(BadmintonCategory category, User participant, String participantLabel) {
        if (participant == null) {
            throw new IllegalArgumentException(participantLabel + " details are required");
        }
        Integer age = calculateAge(participant.getDateOfBirth());
        if (!matchesAgeLimit(category.getAgeLimit(), age)) {
            throw new IllegalArgumentException(String.format(
                    "%s does not meet the age criteria for %s",
                    participantLabel,
                    category.getName()));
        }

        Gender requiredGender = determineRequiredGender(category);
        if (requiredGender != null) {
            Gender participantGender = participant.getGender();
            if (participantGender == null) {
                throw new IllegalArgumentException(String.format(
                        "%s must update gender information to enroll in %s",
                        participantLabel,
                        category.getName()));
            }
            if (participantGender != requiredGender) {
                throw new IllegalArgumentException(String.format(
                        "%s must be %s for %s",
                        participantLabel,
                        requiredGender.name().toLowerCase(),
                        category.getName()));
            }
        }
    }

    private void ensureAadhaarDocuments(User participant, String participantLabel) {
        boolean hasFront = StringUtils.hasText(participant.getAadhaarFrontPhoto());
        boolean hasBack = StringUtils.hasText(participant.getAadhaarBackPhoto());
        if (!hasFront || !hasBack) {
            throw new IllegalArgumentException(String.format(
                    "%s must upload Aadhaar front and back images before registering for this category",
                    participantLabel));
        }
    }

    private void validateFamilyRelationGenders(FamilyRelationMapping mapping, User player, User partner) {
        validateGenderRequirement(mapping.getSelfGender(), player, "Player", mapping.getCategoryName());
        validateGenderRequirement(mapping.getPartnerGender(), partner, "Partner", mapping.getCategoryName());
    }

    private void validateGenderRequirement(Gender requiredGender,
                                           User participant,
                                           String participantLabel,
                                           String categoryName) {
        if (requiredGender == null) {
            return;
        }
        Gender participantGender = participant.getGender();
        if (participantGender == null) {
            throw new IllegalArgumentException(String.format(
                    "%s must update gender information to enroll in %s",
                    participantLabel,
                    categoryName));
        }
        if (participantGender != requiredGender) {
            throw new IllegalArgumentException(String.format(
                    "%s must be %s for %s",
                    participantLabel,
                    requiredGender.name().toLowerCase(),
                    categoryName));
        }
    }

    private boolean matchesAgeLimit(String ageLimit, Integer age) {
        if (age == null || !StringUtils.hasText(ageLimit)) {
            return true;
        }
        String normalized = ageLimit.trim().toUpperCase();
        if ("OPEN".equals(normalized)) {
            return true;
        }
        try {
            if (normalized.startsWith("U")) {
                int max = Integer.parseInt(normalized.substring(1).replaceAll("[^0-9]", ""));
                return age <= max;
            }
            if (normalized.endsWith("+")) {
                int min = Integer.parseInt(normalized.replace("+", "").replaceAll("[^0-9]", ""));
                return age >= min;
            }
        } catch (NumberFormatException ex) {
            log.warn("Unable to parse badminton age limit {}: {}", ageLimit, ex.getMessage());
        }
        return true;
    }

    private Gender determineRequiredGender(BadmintonCategory category) {
        if (category == null || category.getName() == null) {
            return null;
        }
        if (category.getCategoryType() == BadmintonCategoryType.FAMILY) {
            return null;
        }
        String value = category.getName().toLowerCase();
        if (value.contains("women") || value.contains("womens") || value.contains("girl") || value.contains("ladies") || value.contains("female")) {
            return Gender.FEMALE;
        }
        if (value.contains("boys") || value.contains("men's") || value.contains("mens") || value.contains(" men") || value.startsWith("men") || value.contains("male")) {
            return Gender.MALE;
        }
        return null;
    }
}
