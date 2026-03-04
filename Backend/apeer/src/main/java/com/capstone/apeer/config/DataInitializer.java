package com.capstone.apeer.config;

import com.capstone.apeer.model.User;
import com.capstone.apeer.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Auto-build default teacher account if none exists
        List<User> teachers = userRepository.findByRole("teacher");
        if (teachers.isEmpty()) {
            User defaultTeacher = new User();
            defaultTeacher.setFirstName("Admin");
            defaultTeacher.setLastName("Teacher");
            defaultTeacher.setIdNumber("ADMIN_T001");
            defaultTeacher.setEmail("teacher@apeer.com");
            defaultTeacher.setPassword(passwordEncoder.encode("admin123"));
            defaultTeacher.setRole("teacher");

            userRepository.save(defaultTeacher);
            System.out.println("Default teacher account auto-built: teacher@apeer.com / admin123");
        }
    }
}
