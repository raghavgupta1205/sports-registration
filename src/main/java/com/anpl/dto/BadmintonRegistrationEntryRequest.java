package com.anpl.dto;

import com.anpl.model.BadmintonCategoryType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BadmintonRegistrationEntryRequest {
    @NotNull
    private Long categoryId;

    private BadmintonCategoryType categoryType;

    private BadmintonPartnerInfo partnerInfo;

    private BadmintonPartnerInfo secondaryPartnerInfo;

    private String selfRelation;

    private String partnerRelation;
}

