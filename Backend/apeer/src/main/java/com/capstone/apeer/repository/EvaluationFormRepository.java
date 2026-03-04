package com.capstone.apeer.repository;

import com.capstone.apeer.model.EvaluationForm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EvaluationFormRepository extends JpaRepository<EvaluationForm, Long> {
}
