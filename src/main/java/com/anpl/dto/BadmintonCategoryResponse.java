package com.anpl.dto;

import com.anpl.model.BadmintonCategoryType;
import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class BadmintonCategoryResponse {
    Long id;
    String code;
    String displayName;
    BadmintonCategoryType categoryType;
    Integer participantsPerEntry;
    boolean requiresPartnerDetails;
    boolean requiresRelationDetails;
    Integer displayOrder;
    boolean active;
    List<BadmintonCategoryRelationOptionResponse> relationOptions;
}

