package com.quizwiz.controller;

import com.quizwiz.dto.QuestionResponse;
import com.quizwiz.entity.Question;
import com.quizwiz.service.QuestionService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    // Faculty creates a question
    @PostMapping
    public Question createQuestion(
            @Valid @RequestBody Question question) {

        return questionService.createQuestion(question);
    }

    // Get all questions without exposing correct answers
    @GetMapping
    public List<QuestionResponse> getAllQuestions() {

        return questionService.getAllQuestions()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    // Get one question without exposing correct answer
    @GetMapping("/{id}")
    public QuestionResponse getQuestionById(
            @PathVariable Long id) {

        Question question = questionService.getQuestionById(id);

        if (question == null) {
            return null;
        }

        return convertToResponse(question);
    }

    // Faculty updates a question
    @PutMapping("/{id}")
    public Question updateQuestion(
            @PathVariable Long id,
            @Valid @RequestBody Question question) {

        return questionService.updateQuestion(id, question);
    }

    // Faculty deletes a question
    @DeleteMapping("/{id}")
    public String deleteQuestion(@PathVariable Long id) {

        questionService.deleteQuestion(id);

        return "Question deleted successfully";
    }

    // Convert Question entity to safe response
    private QuestionResponse convertToResponse(Question question) {

        return new QuestionResponse(
                question.getId(),
                question.getQuestionText(),
                question.getOptionA(),
                question.getOptionB(),
                question.getOptionC(),
                question.getOptionD()
        );
    }
}