package com.capstone.apeer.repository;

import com.capstone.apeer.model.StudentGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentGroupRepository extends JpaRepository<StudentGroup, Long> {
    Optional<StudentGroup> findByName(String name);

    List<StudentGroup> findByMembers_Email(String email);
}
