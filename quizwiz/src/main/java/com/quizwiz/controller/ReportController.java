package com.quizwiz.controller;

import com.quizwiz.entity.Attempt;
import com.quizwiz.service.ReportService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    // Get all attempts
    @GetMapping("/attempts")
    public List<Attempt> getAllAttempts() {
        return reportService.getAllAttempts();
    }

    // Get attempts for a particular quiz
    @GetMapping("/quiz/{quizId}")
    public List<Attempt> getAttemptsByQuiz(
            @PathVariable Long quizId) {

        return reportService.getAttemptsByQuiz(quizId);
    }

    // Get attempts by student
    @GetMapping("/student/{studentId}")
    public List<Attempt> getAttemptsByStudent(
            @PathVariable Long studentId) {

        return reportService.getAttemptsByStudent(studentId);
    }

    // Get class/department-wise report
    @GetMapping("/department/{department}")
    public List<Attempt> getAttemptsByDepartment(
            @PathVariable String department) {

        return reportService.getAttemptsByDepartment(department);
    }
}