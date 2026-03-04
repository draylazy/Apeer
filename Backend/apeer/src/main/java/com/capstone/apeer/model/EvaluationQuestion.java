package com.capstone.apeer.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "evaluation_questions")
public class EvaluationQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_id", nullable = false)
    @JsonIgnore
    private EvaluationForm evaluationForm;

    @Column(nullable = false)
    private String questionText;

    @Column(nullable = false)
    private String responseType; // e.g., "SCALE", "TEXT", "MULTIPLE_CHOICE"
}
