package com.capstone.apeer.controller;

import com.capstone.apeer.model.StudentGroup;
import com.capstone.apeer.model.User;
import com.capstone.apeer.model.EvaluationForm;
import com.capstone.apeer.model.EvaluationResponse;
import com.capstone.apeer.repository.StudentGroupRepository;
import com.capstone.apeer.repository.UserRepository;
import com.capstone.apeer.repository.EvaluationFormRepository;
import com.capstone.apeer.repository.EvaluationResponseRepository;
import com.capstone.apeer.service.StudentImportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teacher")
public class TeacherController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentGroupRepository groupRepository;

    @Autowired
    private EvaluationFormRepository formRepository;

    @Autowired
    private EvaluationResponseRepository responseRepository;

    @Autowired
    private StudentImportService studentImportService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // --- Students ---
    @GetMapping("/students")
    public ResponseEntity<List<User>> getAllStudents() {
        return ResponseEntity.ok(userRepository.findByRole("student"));
    }

    @PostMapping("/students")
    public ResponseEntity<?> createStudent(@RequestBody User student) {
        if (userRepository.findByEmail(student.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already exists"));
        }
        student.setRole("student");
        student.setPassword(passwordEncoder.encode("student123"));
        return ResponseEntity.ok(userRepository.save(student));
    }

    @PostMapping("/students/import")
    public ResponseEntity<?> importStudents(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Please upload a valid excel file"));
        }
        try {
            List<User> imported = studentImportService.importStudentsFromExcel(file);
            return ResponseEntity.ok(Map.of(
                    "message", "Successfully imported " + imported.size() + " new students",
                    "count", imported.size()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to parse Excel file: " + e.getMessage()));
        }
    }

    // --- Groups ---
    @GetMapping("/groups")
    public ResponseEntity<List<StudentGroup>> getAllGroups() {
        return ResponseEntity.ok(groupRepository.findAll());
    }

    @PostMapping("/groups")
    public ResponseEntity<?> createGroup(@RequestBody Map<String, Object> request) {
        String name = (String) request.get("name");

        if (name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Group name is required"));
        }

        if (groupRepository.findByName(name).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Group name already exists"));
        }

        StudentGroup group = new StudentGroup();
        group.setName(name);

        // Handle student assignments if provided
        if (request.containsKey("memberIds") && request.get("memberIds") instanceof List) {
            List<?> memberIdsRaw = (List<?>) request.get("memberIds");
            List<Long> memberIds = new java.util.ArrayList<>();

            for (Object idObj : memberIdsRaw) {
                if (idObj instanceof Number) {
                    memberIds.add(((Number) idObj).longValue());
                } else if (idObj instanceof String) {
                    try {
                        memberIds.add(Long.parseLong((String) idObj));
                    } catch (NumberFormatException ignored) {
                    }
                }
            }

            if (!memberIds.isEmpty()) {
                List<User> selectedMembers = userRepository.findAllById(memberIds);
                group.setMembers(selectedMembers);
            }
        }

        return ResponseEntity.ok(groupRepository.save(group));
    }

    @PutMapping("/groups/{id}")
    public ResponseEntity<?> updateGroup(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        StudentGroup group = groupRepository.findById(id).orElse(null);
        if (group == null) {
            return ResponseEntity.notFound().build();
        }

        if (request.containsKey("name")) {
            String name = (String) request.get("name");
            if (name != null && !name.trim().isEmpty()) {
                // Check if name is taken by another group
                StudentGroup existing = groupRepository.findByName(name).orElse(null);
                if (existing != null && !existing.getId().equals(id)) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Group name already exists"));
                }
                group.setName(name);
            }
        }

        // Handle student assignments
        if (request.containsKey("memberIds") && request.get("memberIds") instanceof List) {
            List<?> memberIdsRaw = (List<?>) request.get("memberIds");
            List<Long> memberIds = new java.util.ArrayList<>();

            for (Object idObj : memberIdsRaw) {
                if (idObj instanceof Number) {
                    memberIds.add(((Number) idObj).longValue());
                } else if (idObj instanceof String) {
                    try {
                        memberIds.add(Long.parseLong((String) idObj));
                    } catch (NumberFormatException ignored) {
                    }
                }
            }

            List<User> selectedMembers = userRepository.findAllById(memberIds);
            group.setMembers(selectedMembers);
        }

        return ResponseEntity.ok(groupRepository.save(group));
    }

    @DeleteMapping("/groups/{id}")
    public ResponseEntity<?> deleteGroup(@PathVariable Long id) {
        if (!groupRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        groupRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Group deleted successfully"));
    }

    // --- Forms ---
    @GetMapping("/forms")
    public ResponseEntity<List<EvaluationForm>> getAllForms() {
        return ResponseEntity.ok(formRepository.findAll());
    }

    @PostMapping("/forms")
    public ResponseEntity<EvaluationForm> createForm(@RequestBody EvaluationForm form) {
        // Link questions to the form before saving
        if (form.getQuestions() != null) {
            form.getQuestions().forEach(q -> q.setEvaluationForm(form));
        }
        return ResponseEntity.ok(formRepository.save(form));
    }

    @DeleteMapping("/forms/{id}")
    @Transactional
    public ResponseEntity<?> deleteForm(@PathVariable Long id) {
        if (!formRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        // Delete all student evaluation responses tied to this form first to avoid
        // Foreign Key errors
        responseRepository.deleteByFormId(id);

        // Now it's safe to delete the form (and its cascade-linked questions)
        formRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Form deleted successfully"));
    }

    // --- Evaluations ---
    @GetMapping("/evaluations")
    public ResponseEntity<List<EvaluationResponse>> getAllResponses() {
        return ResponseEntity.ok(responseRepository.findAll());
    }
}
