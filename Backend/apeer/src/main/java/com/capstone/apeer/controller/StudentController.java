package com.capstone.apeer.controller;

import com.capstone.apeer.model.EvaluationForm;
import com.capstone.apeer.model.StudentGroup;
import com.capstone.apeer.model.User;
import com.capstone.apeer.repository.EvaluationFormRepository;
import com.capstone.apeer.repository.StudentGroupRepository;
import com.capstone.apeer.repository.UserRepository;
import com.capstone.apeer.model.EvaluationResponse;
import com.capstone.apeer.model.EvaluationQuestion;
import com.capstone.apeer.repository.EvaluationResponseRepository;
import com.capstone.apeer.repository.EvaluationQuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/student")
public class StudentController {

    @Autowired
    private EvaluationFormRepository formRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentGroupRepository groupRepository;

    @Autowired
    private EvaluationResponseRepository responseRepository;

    @Autowired
    private EvaluationQuestionRepository questionRepository;

    @GetMapping("/forms/{studentEmail}")
    public ResponseEntity<List<EvaluationForm>> getFormsForStudent(@PathVariable String studentEmail) {
        // Here we first verify the student exists in our imported user database
        Optional<User> student = userRepository.findByEmail(studentEmail);

        if (student.isEmpty() || !"student".equals(student.get().getRole())) {
            // If they aren't an imported student, return empty list or unauthorized
            return ResponseEntity.status(403).build();
        }

        // If they are a valid student, return the forms
        // Note: For now we return all forms, but this could filter by Group later
        List<EvaluationForm> activeForms = formRepository.findAll();
        return ResponseEntity.ok(activeForms);
    }

    @GetMapping("/group/{studentEmail}")
    public ResponseEntity<List<StudentGroup>> getStudentGroups(@PathVariable String studentEmail) {
        Optional<User> student = userRepository.findByEmail(studentEmail);

        if (student.isEmpty() || !"student".equals(student.get().getRole())) {
            return ResponseEntity.status(403).build();
        }

        List<StudentGroup> groups = groupRepository.findByMembers_Email(studentEmail);
        return ResponseEntity.ok(groups);
    }

    @PostMapping("/evaluations")
    public ResponseEntity<?> submitEvaluation(@RequestBody List<Map<String, Object>> payload) {
        if (payload == null || payload.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "No evaluation data provided"));
        }

        List<EvaluationResponse> responses = new ArrayList<>();

        for (Map<String, Object> item : payload) {
            try {
                Long formId = Long.parseLong(item.get("formId").toString());
                Long evaluatorId = Long.parseLong(item.get("evaluatorId").toString());
                Long evaluateeId = Long.parseLong(item.get("evaluateeId").toString());
                Long questionId = Long.parseLong(item.get("questionId").toString());
                String answer = item.get("answer").toString();

                EvaluationForm form = formRepository.findById(formId).orElse(null);

                if (form != null && form.getDeadline() != null && LocalDateTime.now().isAfter(form.getDeadline())) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("message", "The deadline for this evaluation form has passed."));
                }

                User evaluator = userRepository.findById(evaluatorId).orElse(null);
                User evaluatee = userRepository.findById(evaluateeId).orElse(null);
                EvaluationQuestion question = questionRepository.findById(questionId).orElse(null);

                if (form != null && evaluator != null && evaluatee != null && question != null) {
                    EvaluationResponse response = new EvaluationResponse();
                    response.setForm(form);
                    response.setEvaluator(evaluator);
                    response.setEvaluatee(evaluatee);
                    response.setQuestion(question);
                    response.setAnswer(answer);
                    response.setSubmittedAt(LocalDateTime.now());
                    responses.add(response);
                }
            } catch (Exception e) {
                // Skip invalid items or log them
                e.printStackTrace();
            }
        }

        if (responses.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to parse any valid evaluations"));
        }

        responseRepository.saveAll(responses);
        return ResponseEntity.ok(Map.of("message", "Evaluation submitted successfully", "count", responses.size()));
    }
}
