package com.anpl.dto;

import com.anpl.model.BadmintonCategoryType;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class BadmintonRegistrationEntryResponse {
    Long entryId;
    String categoryCode;
    String categoryName;
    BadmintonCategoryType categoryType;
    String primaryPlayerName;
    Integer primaryPlayerAge;
    String primaryPlayerRelation;
    String partnerPlayerName;
    Integer partnerPlayerAge;
    String partnerPlayerRelation;
    Integer participantsCount;
    Double entryFee;
    String notes;
}

