package com.anpl.dto;

import com.anpl.model.BadmintonCategoryType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BadmintonRegistrationEntryResponse {
    private Long entryId;
    private Long categoryId;
    private String categoryName;
    private BadmintonCategoryType categoryType;
    private Integer pricePerPlayer;
    private String registrationCode;
    private BadmintonPartnerInfo partnerInfo;
    private BadmintonPartnerInfo secondaryPartnerInfo;
    private String selfRelation;
    private String partnerRelation;
}

