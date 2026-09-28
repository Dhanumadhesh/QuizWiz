import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Circle,
  AlertTriangle,
  Send,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { Card } from '@/components/Card';
import { Loading, ErrorBanner } from '@/components/Feedback';
import { ConfirmDialog } from '@/components/Dialogs';
import { useApp } from '@/context/AppContext';
import { quizzesApi, questionsApi, attemptsApi, reportsApi } from '@/services/api';
import { getErrorMessage, formatDuration } from '@/utils/helpers';

export default function QuizAttempt() {
  const { quizId } = useParams();
  const { studentId } = useApp();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expired, setExpired] = useState(false);
  const [savingAnswer, setSavingAnswer] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load quiz + questions
  useEffect(() => {
    const load = async () => {
      try {
        const [quizData, allQuestions] = await Promise.all([
          quizzesApi.get(quizId!),
          questionsApi.list(),
        ]);
        setQuiz(quizData);
        const quizQuestions = (Array.isArray(allQuestions) ? allQuestions : []).filter(
          (q) => q.quizId === Number(quizId)
        );
        if (quizQuestions.length === 0) {
          setError('This quiz has no questions yet. Please check back later.');
          setLoading(false);
          return;
        }
        setQuestions(quizQuestions);

        // Check if already attempted
        try {
          const studentAttempts = await reportsApi.studentReport(studentId!);
          const existing = (Array.isArray(studentAttempts) ? studentAttempts : []).find(
            (a) => (a.quizId || a.quiz?.id) === Number(quizId)
          );
          if (existing && existing.submitted) {
            navigate(`/student/quizzes/${quizId}/result?attemptId=${existing.id}`);
            return;
          }
        } catch {
          // ignore
        }

        // Start attempt
        setStarting(true);
        const attempt = await attemptsApi.start(studentId!, quizId!);
        setAttemptId(attempt.id);
        setTimeLeft(quizData.timeLimit * 60);
        setStarting(false);
        setLoading(false);
      } catch (err) {
        setError(getErrorMessage(err));
        setStarting(false);
        setLoading(false);
      }
    };
    load();
  }, [quizId, studentId]);

  // Timer
  useEffect(() => {
    if (attemptId === null || loading) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setExpired(true);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [attemptId, loading]);

  const handleSelectAnswer = async (questionId: number, answer: string) => {
    if (expired || submitting) return;
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    setSavingAnswer(true);
    setSubmitError('');
    try {
      await attemptsApi.saveAnswer(attemptId!, questionId, answer);
    } catch (err) {
      const msg = getErrorMessage(err);
      setSubmitError(msg);
      if (msg.includes('Time expired') || msg.includes('already been submitted')) {
        setExpired(true);
        if (timerRef.current) clearInterval(timerRef.current);
        handleSubmit(true);
      }
    } finally {
      setSavingAnswer(false);
    }
  };

  const handleSubmit = useCallback(
    async (autoSubmit = false) => {
      if (submitting) return;
      setSubmitting(true);
      setSubmitError('');
      if (timerRef.current) clearInterval(timerRef.current);
      try {
        const result = await attemptsApi.submit(attemptId!);
        navigate(`/student/quizzes/${quizId}/result`, {
          state: { result, autoSubmit, quizTitle: quiz?.title },
        });
      } catch (err) {
        const msg = getErrorMessage(err);
        setSubmitError(msg);
        setSubmitting(false);
        // If already submitted, go to result
        if (msg.includes('already been submitted')) {
          try {
            const result = await attemptsApi.get(attemptId!);
            navigate(`/student/quizzes/${quizId}/result`, {
              state: { result, autoSubmit: true, quizTitle: quiz?.title },
            });
          } catch {
            setSubmitting(false);
          }
        }
      }
    },
    [attemptId, quizId, quiz, navigate, submitting]
  );

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];
  const isLowTime = timeLeft <= 30 && timeLeft > 0;

  if (loading || starting) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 size={32} className="text-blue-600 animate-spin mb-3" />
        <p className="text-sm text-slate-500">
          {starting ? 'Starting your quiz attempt...' : 'Loading quiz...'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl">
        <button
          onClick={() => navigate('/student/quizzes')}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4"
        >
          <ArrowLeft size={16} />
          Back to quizzes
        </button>
        <ErrorBanner message={error} />
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="max-w-2xl">
        <ErrorBanner message="No questions available for this quiz." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with timer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">{quiz?.title}</h1>
          <p className="text-sm text-slate-500">
            Question {currentIndex + 1} of {totalQuestions}
          </p>
        </div>
        <div
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-lg ${
            expired
              ? 'bg-rose-100 text-rose-700'
              : isLowTime
              ? 'bg-amber-100 text-amber-700 animate-pulse'
              : 'bg-blue-50 text-blue-700'
          }`}
        >
          <Clock size={20} />
          {formatDuration(timeLeft)}
        </div>
      </div>

      {submitError && (
        <div className="mb-4">
          <ErrorBanner message={submitError} />
        </div>
      )}

      {expired && (
        <div className="mb-4 bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle size={20} className="text-rose-600" />
          <p className="text-sm text-rose-700 font-medium">
            Time expired! Your quiz is being submitted automatically.
          </p>
        </div>
      )}

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-500">
            {answeredCount} of {totalQuestions} answered
          </span>
          <span className="text-sm text-slate-400">{Math.round((answeredCount / totalQuestions) * 100)}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-300"
            style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question navigator */}
      <div className="flex flex-wrap gap-2 mb-6">
        {questions.map((q, idx) => {
          const isAnswered = !!answers[q.id];
          const isCurrent = idx === currentIndex;
          return (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(idx)}
              disabled={expired}
              className={`w-9 h-9 rounded-xl text-sm font-semibold flex items-center justify-center transition-all ${
                isCurrent
                  ? 'ring-2 ring-blue-500 ring-offset-1'
                  : ''
              } ${
                isAnswered
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-500'
              } ${expired ? 'opacity-60 cursor-not-allowed' : 'hover:bg-slate-200'}`}
            >
              {isAnswered ? <CheckCircle size={16} /> : idx + 1}
            </button>
          );
        })}
      </div>

      {/* Question card */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold">
            {currentIndex + 1}
          </span>
          {answers[currentQuestion.id] ? (
            <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
              <CheckCircle size={14} />
              Answered
            </span>
          ) : (
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
              <Circle size={14} />
              Not answered
            </span>
          )}
        </div>

        <h2 className="text-lg font-semibold text-slate-800 mb-6">{currentQuestion.questionText}</h2>

        <div className="space-y-3">
          {(['A', 'B', 'C', 'D'] as const).map((opt) => {
            const isSelected = answers[currentQuestion.id] === opt;
            return (
              <button
                key={opt}
                onClick={() => handleSelectAnswer(currentQuestion.id, opt)}
                disabled={expired || savingAnswer}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                } ${expired ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
              >
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {opt}
                </span>
                <span className={`text-sm ${isSelected ? 'text-blue-900 font-medium' : 'text-slate-700'}`}>
                  {currentQuestion[`option${opt}`]}
                </span>
              </button>
            );
          })}
        </div>

        {savingAnswer && (
          <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
            <Loader2 size={12} className="animate-spin" />
            Saving answer...
          </p>
        )}
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentIndex === 0 || expired}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={18} />
          Previous
        </button>

        {currentIndex < totalQuestions - 1 ? (
          <button
            onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
            disabled={expired}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50"
          >
            Next
            <ChevronRight size={18} />
          </button>
        ) : (
          <button
            onClick={() => setShowSubmitConfirm(true)}
            disabled={expired || submitting}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors disabled:opacity-50"
          >
            <Send size={16} />
            Submit Quiz
          </button>
        )}
      </div>

      <ConfirmDialog
        open={showSubmitConfirm}
        onClose={() => setShowSubmitConfirm(false)}
        onConfirm={() => {
          setShowSubmitConfirm(false);
          handleSubmit(false);
        }}
        title="Submit Quiz?"
        message={`You have answered ${answeredCount} of ${totalQuestions} questions. ${
          answeredCount < totalQuestions
            ? 'Unanswered questions will be marked as incorrect. '
            : ''
        }Are you sure you want to submit?`}
        confirmLabel="Yes, Submit"
        danger
      />
    </div>
  );
}
