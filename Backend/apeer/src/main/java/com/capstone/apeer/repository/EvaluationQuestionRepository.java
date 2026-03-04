package com.capstone.apeer.repository;

import com.capstone.apeer.model.EvaluationQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EvaluationQuestionRepository extends JpaRepository<EvaluationQuestion, Long> {
}
