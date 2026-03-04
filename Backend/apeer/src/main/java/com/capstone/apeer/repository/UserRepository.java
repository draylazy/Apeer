package com.capstone.apeer.repository;

import com.capstone.apeer.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByIdNumber(String idNumber);

    java.util.List<User> findByRole(String role);
}
