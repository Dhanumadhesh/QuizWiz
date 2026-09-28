import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  HelpCircle,
  Play,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { Card } from '@/components/Card';
import { Loading, ErrorBanner } from '@/components/Feedback';
import { Badge } from '@/components/Dialogs';
import { useApp } from '@/context/AppContext';
import { quizzesApi, questionsApi, reportsApi } from '@/services/api';
import { getErrorMessage, formatDateTime } from '@/utils/helpers';

export default function QuizInfo() {
  const { quizId } = useParams();
  const { studentId } = useApp();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<any>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [existingAttempt, setExistingAttempt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [quizData, allQuestions, studentAttempts] = await Promise.all([
          quizzesApi.get(quizId!),
          questionsApi.list(),
          reportsApi.studentReport(studentId!).catch(() => []),
        ]);
        setQuiz(quizData);
        setQuestionCount(
          (Array.isArray(allQuestions) ? allQuestions : []).filter((q) => q.quizId === Number(quizId)).length
        );
        const found = (Array.isArray(studentAttempts) ? studentAttempts : []).find(
          (a) => (a.quizId || a.quiz?.id) === Number(quizId)
        );
        setExistingAttempt(found || null);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [quizId, studentId]);

  if (loading) return <Loading label="Loading quiz..." />;
  if (error) return <ErrorBanner message={error} />;
  if (!quiz) return <ErrorBanner message="Quiz not found." />;

  const alreadySubmitted = existingAttempt?.submitted;

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/student/quizzes')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4"
      >
        <ArrowLeft size={16} />
        Back to quizzes
      </button>

      <Card className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white">
            <HelpCircle size={28} />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-800">{quiz.title}</h1>
            <p className="text-sm text-slate-500 mt-1">{quiz.description || 'No description provided.'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-400">Time Limit</p>
              <p className="text-sm font-semibold text-slate-700">{quiz.timeLimit} minutes</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <HelpCircle size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-400">Questions</p>
              <p className="text-sm font-semibold text-slate-700">{questionCount} MCQs</p>
            </div>
          </div>
        </div>

        {alreadySubmitted && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4 flex items-center gap-3">
            <CheckCircle size={20} className="text-emerald-600" />
            <div>
              <p className="text-sm font-medium text-emerald-700">You have already completed this quiz.</p>
              <p className="text-xs text-emerald-600 mt-0.5">
                Score: {existingAttempt.score} | Submitted: {formatDateTime(existingAttempt.submittedTime)}
              </p>
            </div>
          </div>
        )}

        {!alreadySubmitted && questionCount === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 flex items-center gap-3">
            <AlertCircle size={20} className="text-amber-600" />
            <p className="text-sm font-medium text-amber-700">
              This quiz has no questions yet. Please check back later.
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">Before you begin:</h3>
          <ul className="space-y-1.5 text-sm text-blue-700">
            <li className="flex items-start gap-2">
              <span className="w-1 h-1 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
              You will have {quiz.timeLimit} minutes to complete this quiz.
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1 h-1 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
              The quiz will auto-submit when the timer reaches zero.
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1 h-1 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
              You can navigate between questions using Previous/Next buttons.
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1 h-1 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
              Each question has one correct answer (A, B, C, or D).
            </li>
          </ul>
        </div>

        {alreadySubmitted ? (
          <button
            onClick={() => navigate(`/student/quizzes/${quizId}/result?attemptId=${existingAttempt.id}`)}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <CheckCircle size={18} />
            View Result
          </button>
        ) : questionCount > 0 ? (
          <button
            onClick={() => navigate(`/student/quizzes/${quizId}/attempt`)}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-200"
          >
            <Play size={18} />
            Start Quiz
          </button>
        ) : (
          <button
            disabled
            className="w-full py-3 bg-slate-200 text-slate-400 font-semibold rounded-xl cursor-not-allowed"
          >
            No Questions Available
          </button>
        )}
      </Card>
    </div>
  );
}
