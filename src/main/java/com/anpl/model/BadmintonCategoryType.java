package com.anpl.model;

/**
 * Represents the structure of a badminton category entry.
 * SOLO  -> single participant, no partner details required.
 * DOUBLE -> requires partner information, but no relation metadata.
 * FAMILY -> requires partner information along with relationship context.
 */
public enum BadmintonCategoryType {
    SOLO,
    DOUBLE,
    FAMILY
}

