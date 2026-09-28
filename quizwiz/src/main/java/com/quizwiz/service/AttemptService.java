package com.quizwiz.service;

import com.quizwiz.entity.Answer;
import com.quizwiz.entity.Attempt;
import com.quizwiz.entity.Question;
import com.quizwiz.entity.Quiz;
import com.quizwiz.entity.Student;
import com.quizwiz.exception.DuplicateAttemptException;
import com.quizwiz.exception.ResourceNotFoundException;
import com.quizwiz.repository.AnswerRepository;
import com.quizwiz.repository.AttemptRepository;
import com.quizwiz.repository.QuestionRepository;
import com.quizwiz.repository.QuizRepository;
import com.quizwiz.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AttemptService {

    private final AttemptRepository attemptRepository;
    private final AnswerRepository answerRepository;
    private final StudentRepository studentRepository;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;

    public AttemptService(
            AttemptRepository attemptRepository,
            AnswerRepository answerRepository,
            StudentRepository studentRepository,
            QuizRepository quizRepository,
            QuestionRepository questionRepository) {

        this.attemptRepository = attemptRepository;
        this.answerRepository = answerRepository;
        this.studentRepository = studentRepository;
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
    }

    // Start a quiz attempt
    public Attempt startAttempt(Long studentId, Long quizId) {

        Student student = studentRepository.findById(studentId).orElse(null);
        Quiz quiz = quizRepository.findById(quizId).orElse(null);

        if (student == null) {
            throw new ResourceNotFoundException(
                    "Student not found with id: " + studentId);
        }

        if (quiz == null) {
            throw new ResourceNotFoundException(
                    "Quiz not found with id: " + quizId);
        }

        // Prevent duplicate attempt
        if (attemptRepository
                .findByStudentIdAndQuizId(studentId, quizId)
                .isPresent()) {

            throw new DuplicateAttemptException(
                    "Student has already attempted this quiz");
        }

        Attempt attempt = new Attempt();

        attempt.setStudent(student);
        attempt.setQuiz(quiz);
        attempt.setScore(0);
        attempt.setStartTime(LocalDateTime.now());
        attempt.setSubmitted(false);

        return attemptRepository.save(attempt);
    }

    // Save or update student's answer
    public Answer saveAnswer(
            Long attemptId,
            Long questionId,
            String selectedAnswer) {

        Attempt attempt = attemptRepository.findById(attemptId).orElse(null);
        Question question = questionRepository.findById(questionId).orElse(null);

        if (attempt == null) {
            throw new ResourceNotFoundException(
                    "Attempt not found with id: " + attemptId);
        }

        if (question == null) {
            throw new ResourceNotFoundException(
                    "Question not found with id: " + questionId);
        }

        if (attempt.getSubmitted()) {
            throw new IllegalStateException(
                    "Quiz has already been submitted");
        }

        // Check whether the question belongs to this quiz
        if (question.getQuiz() == null ||
                !question.getQuiz().getId()
                        .equals(attempt.getQuiz().getId())) {

            throw new IllegalArgumentException(
                    "Question does not belong to this quiz");
        }

        // Validate selected answer
        if (selectedAnswer == null ||
                !(selectedAnswer.equalsIgnoreCase("A") ||
                  selectedAnswer.equalsIgnoreCase("B") ||
                  selectedAnswer.equalsIgnoreCase("C") ||
                  selectedAnswer.equalsIgnoreCase("D"))) {

            throw new IllegalArgumentException(
                    "Selected answer must be A, B, C, or D");
        }

        // Check whether time has expired
        if (isTimeExpired(attempt)) {

            submitAttempt(attemptId);

            throw new IllegalStateException(
                    "Quiz time has expired and the attempt was automatically submitted");
        }

        // Check whether an answer already exists
        Answer answer = answerRepository
                .findByAttemptIdAndQuestionId(attemptId, questionId)
                .orElse(null);

        if (answer == null) {

            // Create a new answer
            answer = new Answer();

            answer.setAttempt(attempt);
            answer.setQuestion(question);
        }

        // Save or update selected answer
        answer.setSelectedAnswer(selectedAnswer.toUpperCase());

        return answerRepository.save(answer);
    }

    // Check whether quiz time has expired
    private boolean isTimeExpired(Attempt attempt) {

        LocalDateTime expiryTime = attempt.getStartTime()
                .plusMinutes(attempt.getQuiz().getTimeLimit());

        return LocalDateTime.now().isAfter(expiryTime);
    }

    // Submit quiz and calculate score
    public Attempt submitAttempt(Long attemptId) {

        Attempt attempt = attemptRepository.findById(attemptId).orElse(null);

        if (attempt == null) {
            throw new ResourceNotFoundException(
                    "Attempt not found with id: " + attemptId);
        }

        if (attempt.getSubmitted()) {
            throw new IllegalStateException(
                    "Quiz has already been submitted");
        }

        List<Answer> answers = answerRepository.findAll();

        int score = 0;

        for (Answer answer : answers) {

            if (answer.getAttempt().getId().equals(attemptId)) {

                String selectedAnswer = answer.getSelectedAnswer();
                String correctAnswer =
                        answer.getQuestion().getCorrectAnswer();

                if (selectedAnswer != null &&
                        selectedAnswer.equalsIgnoreCase(correctAnswer)) {

                    score++;
                }
            }
        }

        attempt.setScore(score);
        attempt.setSubmitted(true);
        attempt.setSubmittedTime(LocalDateTime.now());

        return attemptRepository.save(attempt);
    }

    // Get attempt by ID
    public Attempt getAttemptById(Long id) {

        return attemptRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Attempt not found with id: " + id));
    }
}