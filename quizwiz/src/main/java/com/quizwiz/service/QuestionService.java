package com.quizwiz.service;

import com.quizwiz.entity.Question;
import com.quizwiz.repository.QuestionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;

    public QuestionService(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    public Question createQuestion(Question question) {
        return questionRepository.save(question);
    }

    public List<Question> getAllQuestions() {
        return questionRepository.findAll();
    }

    public Question getQuestionById(Long id) {
        return questionRepository.findById(id).orElse(null);
    }

    public Question updateQuestion(Long id, Question question) {
        Question existingQuestion = questionRepository.findById(id).orElse(null);

        if (existingQuestion != null) {
            existingQuestion.setQuestionText(question.getQuestionText());
            existingQuestion.setOptionA(question.getOptionA());
            existingQuestion.setOptionB(question.getOptionB());
            existingQuestion.setOptionC(question.getOptionC());
            existingQuestion.setOptionD(question.getOptionD());
            existingQuestion.setCorrectAnswer(question.getCorrectAnswer());
            existingQuestion.setQuiz(question.getQuiz());

            return questionRepository.save(existingQuestion);
        }

        return null;
    }

    public void deleteQuestion(Long id) {
        questionRepository.deleteById(id);
    }
}