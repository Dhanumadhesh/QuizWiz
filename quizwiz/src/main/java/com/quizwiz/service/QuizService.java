package com.quizwiz.service;

import com.quizwiz.entity.Quiz;
import com.quizwiz.repository.QuizRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuizService {

    private final QuizRepository quizRepository;

    public QuizService(QuizRepository quizRepository) {
        this.quizRepository = quizRepository;
    }

    public Quiz createQuiz(Quiz quiz) {
        return quizRepository.save(quiz);
    }

    public List<Quiz> getAllQuizzes() {
        return quizRepository.findAll();
    }

    public Quiz getQuizById(Long id) {
        return quizRepository.findById(id).orElse(null);
    }

    public Quiz updateQuiz(Long id, Quiz quiz) {
        Quiz existingQuiz = quizRepository.findById(id).orElse(null);

        if (existingQuiz != null) {
            existingQuiz.setTitle(quiz.getTitle());
            existingQuiz.setDescription(quiz.getDescription());
            existingQuiz.setTimeLimit(quiz.getTimeLimit());

            return quizRepository.save(existingQuiz);
        }

        return null;
    }

    public void deleteQuiz(Long id) {
        quizRepository.deleteById(id);
    }
}