import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// =====================================================
// Students
// =====================================================

export const studentsApi = {
  list: () =>
    api.get('/api/students').then((r) => r.data),

  get: (id: number | string) =>
    api.get(`/api/students/${id}`).then((r) => r.data),

  create: (data: {
    name: string;
    email: string;
    department: string;
  }) =>
    api.post('/api/students', data).then((r) => r.data),

  update: (
    id: number | string,
    data: {
      name: string;
      email: string;
      department: string;
    }
  ) =>
    api.put(`/api/students/${id}`, data).then((r) => r.data),

  remove: (id: number | string) =>
    api.delete(`/api/students/${id}`).then((r) => r.data),
};

// =====================================================
// Quizzes
// =====================================================

export const quizzesApi = {
  list: () =>
    api.get('/api/quizzes').then((r) => r.data),

  get: (id: number | string) =>
    api.get(`/api/quizzes/${id}`).then((r) => r.data),

  create: (data: {
    title: string;
    description: string;
    timeLimit: number;
  }) =>
    api.post('/api/quizzes', data).then((r) => r.data),

  update: (
    id: number | string,
    data: {
      title: string;
      description: string;
      timeLimit: number;
    }
  ) =>
    api.put(`/api/quizzes/${id}`, data).then((r) => r.data),

  remove: (id: number | string) =>
    api.delete(`/api/quizzes/${id}`).then((r) => r.data),
};

// =====================================================
// Questions
// =====================================================

export const questionsApi = {
  // Get all questions
  // Convert backend:
  // quiz: { id: 1 }
  //
  // into frontend-friendly:
  // quizId: 1

  list: () =>
    api.get('/api/questions').then((r) =>
      r.data.map((question: any) => ({
        ...question,
        quizId: question.quiz?.id ?? question.quizId,
      }))
    ),

  // Get one question
  get: (id: number | string) =>
    api.get(`/api/questions/${id}`).then((r) => {
      const question = r.data;

      return {
        ...question,
        quizId: question.quiz?.id ?? question.quizId,
      };
    }),

  // Create question
  //
  // Frontend sends:
  // quizId: 1
  //
  // Backend expects:
  // quiz: { id: 1 }

  create: (data: {
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: string;
    quizId: number;
  }) => {
    const requestData = {
      questionText: data.questionText,
      optionA: data.optionA,
      optionB: data.optionB,
      optionC: data.optionC,
      optionD: data.optionD,
      correctAnswer: data.correctAnswer,
      quiz: {
        id: data.quizId,
      },
    };

    return api.post('/api/questions', requestData).then((r) => {
      const question = r.data;

      return {
        ...question,
        quizId: question.quiz?.id ?? question.quizId,
      };
    });
  },

  // Update question
  //
  // Frontend sends quizId.
  // Backend receives quiz: { id: quizId }.

  update: (
    id: number | string,
    data: {
      questionText: string;
      optionA: string;
      optionB: string;
      optionC: string;
      optionD: string;
      correctAnswer: string;
      quizId: number;
    }
  ) => {
    const requestData = {
      questionText: data.questionText,
      optionA: data.optionA,
      optionB: data.optionB,
      optionC: data.optionC,
      optionD: data.optionD,
      correctAnswer: data.correctAnswer,
      quiz: {
        id: data.quizId,
      },
    };

    return api.put(`/api/questions/${id}`, requestData).then((r) => {
      const question = r.data;

      return {
        ...question,
        quizId: question.quiz?.id ?? question.quizId,
      };
    });
  },

  remove: (id: number | string) =>
    api.delete(`/api/questions/${id}`).then((r) => r.data),
};

// =====================================================
// Attempts
// =====================================================

export const attemptsApi = {
  start: (
    studentId: number | string,
    quizId: number | string
  ) =>
    api
      .post(
        `/api/attempts/start?studentId=${studentId}&quizId=${quizId}`
      )
      .then((r) => r.data),

  saveAnswer: (
    attemptId: number | string,
    questionId: number | string,
    selectedAnswer: string
  ) =>
    api
      .post(
        `/api/attempts/${attemptId}/answers?questionId=${questionId}&selectedAnswer=${selectedAnswer}`
      )
      .then((r) => r.data),

  submit: (attemptId: number | string) =>
    api.post(`/api/attempts/${attemptId}/submit`).then((r) => r.data),

  get: (id: number | string) =>
    api.get(`/api/attempts/${id}`).then((r) => r.data),
};

// =====================================================
// Reports
// =====================================================

export const reportsApi = {
  allAttempts: () =>
    api.get('/api/reports/attempts').then((r) => r.data),

  quizReport: (quizId: number | string) =>
    api.get(`/api/reports/quiz/${quizId}`).then((r) => r.data),

  studentReport: (studentId: number | string) =>
    api
      .get(`/api/reports/student/${studentId}`)
      .then((r) => r.data),

  departmentReport: (department: string) =>
    api
      .get(`/api/reports/department/${department}`)
      .then((r) => r.data),
};

export default api;