package com.quizwiz.repository;

import com.quizwiz.entity.Answer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AnswerRepository extends JpaRepository<Answer, Long> {

    Optional<Answer> findByAttemptIdAndQuestionId(
            Long attemptId,
            Long questionId);
}