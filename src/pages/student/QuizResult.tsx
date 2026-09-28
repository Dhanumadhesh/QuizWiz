import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  CheckCircle,
  Award,
  Clock,
  Calendar,
  ArrowRight,
  Home,
  AlertCircle,
} from 'lucide-react';
import { Card } from '@/components/Card';
import { Loading, ErrorBanner } from '@/components/Feedback';
import { Badge } from '@/components/Dialogs';
import { attemptsApi, quizzesApi } from '@/services/api';
import { getErrorMessage, formatDateTime } from '@/utils/helpers';

export default function QuizResult() {
  const { quizId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const passedState = location.state as any;

  const [result, setResult] = useState<any>(passedState?.result || null);
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(!result);
  const [error, setError] = useState('');
  const [autoSubmit] = useState(passedState?.autoSubmit || false);

  useEffect(() => {
    if (result) {
      quizzesApi.get(quizId!).then(setQuiz).catch(() => {});
      return;
    }
    // Try to fetch result from query param attemptId
    const params = new URLSearchParams(location.search);
    const attemptId = params.get('attemptId');
    if (attemptId) {
      attemptsApi
        .get(attemptId)
        .then((data) => {
          setResult(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(getErrorMessage(err));
          setLoading(false);
        });
      quizzesApi.get(quizId!).then(setQuiz).catch(() => {});
    } else {
      setError('Unable to load quiz result.');
      setLoading(false);
    }
  }, [quizId, result, location.search]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="mt-3 text-sm text-slate-500">Loading your result...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl">
        <ErrorBanner message={error} />
        <button
          onClick={() => navigate('/student/quizzes')}
          className="mt-4 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          <Home size={16} />
          Back to quizzes
        </button>
      </div>
    );
  }

  const quizTitle = quiz?.title || passedState?.quizTitle || 'Quiz';
  const score = result?.score ?? 0;
  const totalQuestions = result?.totalQuestions || result?.totalQuestions;
  const submitted = result?.submitted ?? true;
  const submittedTime = result?.submittedTime;
  const startTime = result?.startTime;

  const percentage = totalQuestions && totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : null;
  const passed = percentage !== null && percentage >= 50;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Result hero card */}
      <Card className="p-8 text-center mb-6">
        <div
          className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4 ${
            passed
              ? 'bg-gradient-to-br from-emerald-400 to-green-500'
              : 'bg-gradient-to-br from-amber-400 to-orange-500'
          }`}
        >
          {passed ? <CheckCircle size={40} className="text-white" /> : <Award size={40} className="text-white" />}
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mb-1">
          {autoSubmit ? 'Time Expired — Quiz Submitted' : 'Quiz Submitted!'}
        </h1>
        <p className="text-sm text-slate-500 mb-6">{quizTitle}</p>

        {autoSubmit && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6 flex items-center justify-center gap-2">
            <Clock size={16} className="text-amber-600" />
            <p className="text-sm text-amber-700 font-medium">
              Your quiz was automatically submitted because the time limit expired.
            </p>
          </div>
        )}

        {/* Score display */}
        <div className="bg-slate-50 rounded-2xl p-6 mb-4">
          <p className="text-sm text-slate-500 mb-1">Your Score</p>
          <p className="text-5xl font-bold text-slate-800">
            {score}
            {totalQuestions ? <span className="text-2xl text-slate-400"> / {totalQuestions}</span> : null}
          </p>
          {percentage !== null && (
            <div className="mt-3">
              <Badge color={passed ? 'green' : 'amber'}>{percentage}% — {passed ? 'Passed' : 'Keep practicing'}</Badge>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="grid sm:grid-cols-2 gap-3 text-left">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-400">Status</p>
              <p className="text-sm font-medium text-slate-700">
                {submitted ? 'Submitted' : 'In Progress'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
              <Calendar size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-400">Submitted</p>
              <p className="text-sm font-medium text-slate-700">{formatDateTime(submittedTime)}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => navigate('/student/quizzes')}
          className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
        >
          <ArrowRight size={16} />
          Back to Quizzes
        </button>
        <button
          onClick={() => navigate('/student')}
          className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
        >
          <Home size={16} />
          Dashboard
        </button>
      </div>
    </div>
  );
}
