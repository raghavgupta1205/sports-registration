package com.anpl.dto;

import lombok.Data;

@Data
public class BadmintonPartnerInfo {
    private Long userId;
    private String fullName;
    private Integer age;
    private String contactNumber;
    private String relationLabel;
    private String playerPhoto;
    private String houseNumber;
}

