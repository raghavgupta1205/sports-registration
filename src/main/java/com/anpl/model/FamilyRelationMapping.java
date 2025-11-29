package com.anpl.model;

import lombok.Getter;

@Getter
public enum FamilyRelationMapping {
    HUSBAND_WIFE("Husband & Wife", "Husband", "Wife", Gender.MALE, Gender.FEMALE),
    WIFE_HUSBAND("Husband & Wife", "Wife", "Husband", Gender.FEMALE, Gender.MALE),
    FATHER_DAUGHTER("Father Daughter", "Father", "Daughter", Gender.MALE, Gender.FEMALE),
    DAUGHTER_FATHER("Father Daughter", "Daughter", "Father", Gender.FEMALE, Gender.MALE),
    MOTHER_DAUGHTER("Mother Daughter", "Mother", "Daughter", Gender.FEMALE, Gender.FEMALE),
    DAUGHTER_MOTHER("Mother Daughter", "Daughter", "Mother", Gender.FEMALE, Gender.FEMALE),
    MOTHER_SON("Mother Son", "Mother", "Son", Gender.FEMALE, Gender.MALE),
    SON_MOTHER("Mother Son", "Son", "Mother", Gender.MALE, Gender.FEMALE),
    FATHER_SON_U15("Father Son U15", "Father", "Son", Gender.MALE, Gender.MALE),
    SON_FATHER_U15("Father Son U15", "Son", "Father", Gender.MALE, Gender.MALE),
    FATHER_SON_15_PLUS("Father Son 15+", "Father", "Son", Gender.MALE, Gender.MALE),
    SON_FATHER_15_PLUS("Father Son 15+", "Son", "Father", Gender.MALE, Gender.MALE),
    SAAS_BAHU("Saas Bahu", "Saas", "Bahu", Gender.FEMALE, Gender.FEMALE),
    BAHU_SAAS("Saas Bahu", "Bahu", "Saas", Gender.FEMALE, Gender.FEMALE);

    private final String categoryName;
    private final String selfRelation;
    private final String partnerRelation;
    private final Gender selfGender;
    private final Gender partnerGender;

    FamilyRelationMapping(String categoryName,
                          String selfRelation,
                          String partnerRelation,
                          Gender selfGender,
                          Gender partnerGender) {
        this.categoryName = categoryName;
        this.selfRelation = selfRelation;
        this.partnerRelation = partnerRelation;
        this.selfGender = selfGender;
        this.partnerGender = partnerGender;
    }

    public static FamilyRelationMapping forCategoryAndSelf(String categoryName, String selfRelation) {
        for (FamilyRelationMapping mapping : values()) {
            if (mapping.categoryName.equalsIgnoreCase(categoryName)
                    && mapping.selfRelation.equalsIgnoreCase(selfRelation)) {
                return mapping;
            }
        }
        return null;
    }
}

