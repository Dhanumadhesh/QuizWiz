package com.quizwiz.service;

import com.quizwiz.entity.Attempt;
import com.quizwiz.repository.AttemptRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReportService {

    private final AttemptRepository attemptRepository;

    public ReportService(AttemptRepository attemptRepository) {
        this.attemptRepository = attemptRepository;
    }

    // Get all attempts
    public List<Attempt> getAllAttempts() {
        return attemptRepository.findAll();
    }

    // Get attempts for a particular quiz
    public List<Attempt> getAttemptsByQuiz(Long quizId) {
        return attemptRepository.findByQuizId(quizId);
    }

    // Get attempts by student
    public List<Attempt> getAttemptsByStudent(Long studentId) {
        return attemptRepository.findAll()
                .stream()
                .filter(attempt ->
                        attempt.getStudent() != null &&
                        attempt.getStudent().getId().equals(studentId))
                .toList();
    }

    // Get class/department-wise report
    public List<Attempt> getAttemptsByDepartment(String department) {
        return attemptRepository.findByStudentDepartment(department);
    }
}