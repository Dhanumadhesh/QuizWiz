package com.quizwiz.controller;

import com.quizwiz.entity.Answer;
import com.quizwiz.entity.Attempt;
import com.quizwiz.service.AttemptService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/attempts")
public class AttemptController {

    private final AttemptService attemptService;

    public AttemptController(AttemptService attemptService) {
        this.attemptService = attemptService;
    }

    @PostMapping("/start")
    public Attempt startAttempt(
            @RequestParam Long studentId,
            @RequestParam Long quizId) {

        return attemptService.startAttempt(studentId, quizId);
    }

    @PostMapping("/{attemptId}/answers")
    public Answer saveAnswer(
            @PathVariable Long attemptId,
            @RequestParam Long questionId,
            @RequestParam String selectedAnswer) {

        return attemptService.saveAnswer(
                attemptId,
                questionId,
                selectedAnswer);
    }

    @PostMapping("/{attemptId}/submit")
    public Attempt submitAttempt(@PathVariable Long attemptId) {
        return attemptService.submitAttempt(attemptId);
    }

    @GetMapping("/{id}")
    public Attempt getAttemptById(@PathVariable Long id) {
        return attemptService.getAttemptById(id);
    }
}