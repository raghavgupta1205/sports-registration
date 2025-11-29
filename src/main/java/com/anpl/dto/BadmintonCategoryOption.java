package com.anpl.dto;

import com.anpl.model.BadmintonCategoryType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BadmintonCategoryOption {
    private Long id;
    private String name;
    private BadmintonCategoryType categoryType;
    private Integer pricePerPlayer;
    private String ageLimit;
    private String description;
}

