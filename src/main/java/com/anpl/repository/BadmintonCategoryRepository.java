package com.anpl.repository;

import com.anpl.model.BadmintonCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BadmintonCategoryRepository extends JpaRepository<BadmintonCategory, Long> {
    List<BadmintonCategory> findAllByActiveTrueOrderByDisplayOrderAscNameAsc();
}

