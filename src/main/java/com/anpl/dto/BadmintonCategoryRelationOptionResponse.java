package com.anpl.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class BadmintonCategoryRelationOptionResponse {
    String selfRole;
    String partnerRole;
}

