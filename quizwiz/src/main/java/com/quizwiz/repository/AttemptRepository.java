package com.quizwiz.repository;

import com.quizwiz.entity.Attempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AttemptRepository extends JpaRepository<Attempt, Long> {

    Optional<Attempt> findByStudentIdAndQuizId(
            Long studentId,
            Long quizId);

    List<Attempt> findByQuizId(Long quizId);

    List<Attempt> findByStudentDepartment(String department);
}