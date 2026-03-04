package com.capstone.apeer.repository;

import com.capstone.apeer.model.EvaluationResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface EvaluationResponseRepository extends JpaRepository<EvaluationResponse, Long> {
    List<EvaluationResponse> findByFormId(Long formId);

    @Transactional
    void deleteByFormId(Long formId);

    List<EvaluationResponse> findByEvaluateeId(Long evaluateeId);

    List<EvaluationResponse> findByEvaluatorId(Long evaluatorId);
}
