package com.anpl.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "badminton_categories", schema = "anpl_sports")
public class BadmintonCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "category_type", nullable = false, length = 20)
    private BadmintonCategoryType categoryType;

    @Column(name = "price_per_player", nullable = false)
    private Integer pricePerPlayer = 800;

    @Column(name = "age_limit", length = 50)
    private String ageLimit;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "display_order")
    private Integer displayOrder = 0;

    @Column(name = "active", nullable = false)
    private Boolean active = true;
}

