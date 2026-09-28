import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from '@/context/AppContext';
import { FacultyLayout } from '@/layouts/FacultyLayout';
import { StudentLayout } from '@/layouts/StudentLayout';
import LandingPage from '@/pages/LandingPage';
import FacultyDashboard from '@/pages/faculty/FacultyDashboard';
import QuizManagement from '@/pages/faculty/QuizManagement';
import QuizForm from '@/pages/faculty/QuizForm';
import QuizDetails from '@/pages/faculty/QuizDetails';
import QuestionManagement from '@/pages/faculty/QuestionManagement';
import QuestionForm from '@/pages/faculty/QuestionForm';
import StudentManagement from '@/pages/faculty/StudentManagement';
import Reports from '@/pages/faculty/Reports';
import StudentDashboard from '@/pages/student/StudentDashboard';
import StudentQuizList from '@/pages/student/StudentQuizList';
import QuizInfo from '@/pages/student/QuizInfo';
import QuizAttempt from '@/pages/student/QuizAttempt';
import QuizResult from '@/pages/student/QuizResult';
import { ReactNode } from 'react';

function FacultyRoute({ children }: { children: ReactNode }) {
  const { role } = useApp();
  const location = useLocation();
  if (role !== 'faculty') return <Navigate to="/" state={{ from: location }} replace />;
  return <FacultyLayout>{children}</FacultyLayout>;
}

function StudentRoute({ children }: { children: ReactNode }) {
  const { role, studentId } = useApp();
  const location = useLocation();
  if (role !== 'student' || !studentId) return <Navigate to="/" state={{ from: location }} replace />;
  return <StudentLayout>{children}</StudentLayout>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      {/* Faculty routes */}
      <Route path="/faculty" element={<FacultyRoute><FacultyDashboard /></FacultyRoute>} />
      <Route path="/faculty/quizzes" element={<FacultyRoute><QuizManagement /></FacultyRoute>} />
      <Route path="/faculty/quizzes/new" element={<FacultyRoute><QuizForm /></FacultyRoute>} />
      <Route path="/faculty/quizzes/:id" element={<FacultyRoute><QuizDetails /></FacultyRoute>} />
      <Route path="/faculty/quizzes/:id/edit" element={<FacultyRoute><QuizForm /></FacultyRoute>} />
      <Route path="/faculty/questions" element={<FacultyRoute><QuestionManagement /></FacultyRoute>} />
      <Route path="/faculty/questions/new" element={<FacultyRoute><QuestionForm /></FacultyRoute>} />
      <Route path="/faculty/questions/:id/edit" element={<FacultyRoute><QuestionForm /></FacultyRoute>} />
      <Route path="/faculty/students" element={<FacultyRoute><StudentManagement /></FacultyRoute>} />
      <Route path="/faculty/students/new" element={<FacultyRoute><StudentManagement /></FacultyRoute>} />
      <Route path="/faculty/reports" element={<FacultyRoute><Reports /></FacultyRoute>} />

      {/* Student routes */}
      <Route path="/student" element={<StudentRoute><StudentDashboard /></StudentRoute>} />
      <Route path="/student/quizzes" element={<StudentRoute><StudentQuizList /></StudentRoute>} />
      <Route path="/student/quizzes/:quizId" element={<StudentRoute><QuizInfo /></StudentRoute>} />
      <Route path="/student/quizzes/:quizId/attempt" element={<StudentRoute><QuizAttempt /></StudentRoute>} />
      <Route path="/student/quizzes/:quizId/result" element={<StudentRoute><QuizResult /></StudentRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
