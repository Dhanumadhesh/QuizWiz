import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Pencil,
  HelpCircle,
  Plus,
  BarChart3,
  Clock,
  FileText,
  Trash2,
} from 'lucide-react';
import { Card } from '@/components/Card';
import { Loading, ErrorBanner, EmptyState } from '@/components/Feedback';
import { ConfirmDialog, Badge } from '@/components/Dialogs';
import { quizzesApi, questionsApi, reportsApi } from '@/services/api';
import { getErrorMessage, formatDateTime } from '@/utils/helpers';

export default function QuizDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteQId, setDeleteQId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [quizData, allQuestions, allAttempts] = await Promise.all([
        quizzesApi.get(id!),
        questionsApi.list(),
        reportsApi.quizReport(id!).catch(() => []),
      ]);
      setQuiz(quizData);
      setQuestions(
        (Array.isArray(allQuestions) ? allQuestions : []).filter((q) => q.quizId === Number(id))
      );
      setAttempts(Array.isArray(allAttempts) ? allAttempts : []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleDeleteQuestion = async () => {
    if (deleteQId === null) return;
    setDeleteError('');
    try {
      await questionsApi.remove(deleteQId);
      setDeleteQId(null);
      load();
    } catch (err) {
      setDeleteError(getErrorMessage(err));
    }
  };

  if (loading) return <Loading label="Loading quiz..." />;
  if (error) return <ErrorBanner message={error} onRetry={load} />;
  if (!quiz) return <ErrorBanner message="Quiz not found." />;

  const avgScore =
    attempts.length > 0 && attempts.every((a) => a.submitted)
      ? (attempts.reduce((sum, a) => sum + (a.score || 0), 0) / attempts.length).toFixed(1)
      : null;

  return (
    <div>
      <button
        onClick={() => navigate('/faculty/quizzes')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4"
      >
        <ArrowLeft size={16} />
        Back to quizzes
      </button>

      {deleteError && (
        <div className="mb-4">
          <ErrorBanner message={deleteError} />
        </div>
      )}

      {/* Quiz header */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{quiz.title}</h1>
            <p className="text-sm text-slate-500 mt-1">{quiz.description || 'No description provided.'}</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <Badge color="blue">
                <Clock size={12} className="mr-1" />
                {quiz.timeLimit} minutes
              </Badge>
              <Badge color="cyan">{questions.length} questions</Badge>
              <Badge color="amber">{attempts.length} attempts</Badge>
              {avgScore && <Badge color="green">Avg score: {avgScore}</Badge>}
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              to={`/faculty/quizzes/${id}/edit`}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-2 transition-colors"
            >
              <Pencil size={16} />
              Edit
            </Link>
            <Link
              to={`/faculty/reports?quizId=${id}`}
              className="px-4 py-2 text-sm font-medium text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-xl flex items-center gap-2 transition-colors"
            >
              <BarChart3 size={16} />
              Report
            </Link>
          </div>
        </div>
      </Card>

      {/* Questions section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <HelpCircle size={20} className="text-cyan-600" />
          Questions ({questions.length})
        </h2>
        <Link
          to={`/faculty/questions/new?quizId=${id}`}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-colors"
        >
          <Plus size={16} />
          Add Question
        </Link>
      </div>

      {questions.length === 0 ? (
        <Card className="p-0">
          <EmptyState
            icon={<HelpCircle size={28} />}
            title="No questions yet"
            description="Add MCQ questions to this quiz."
            action={
              <Link
                to={`/faculty/questions/new?quizId=${id}`}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-colors"
              >
                <Plus size={16} />
                Add Question
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {questions.map((q, idx) => (
            <Card key={q.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    <Badge color="green">Correct: {q.correctAnswer}</Badge>
                  </div>
                  <p className="text-sm font-medium text-slate-800 mb-3">{q.questionText}</p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                      <div
                        key={opt}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                          q.correctAnswer === opt
                            ? 'bg-emerald-50 text-emerald-700 font-medium'
                            : 'bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span className="w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-semibold">
                          {opt}
                        </span>
                        {q[`option${opt}`]}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Link
                    to={`/faculty/questions/${q.id}/edit`}
                    className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                  >
                    <Pencil size={16} />
                  </Link>
                  <button
                    onClick={() => {
                      setDeleteError('');
                      setDeleteQId(q.id);
                    }}
                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Recent attempts for this quiz */}
      {attempts.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
            <BarChart3 size={20} className="text-violet-600" />
            Attempts ({attempts.length})
          </h2>
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-3">Student</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-3">Score</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-3">Status</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-3 hidden md:table-cell">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attempts.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3 text-sm font-medium text-slate-700">{a.studentName}</td>
                      <td className="px-6 py-3 text-sm text-slate-600">{a.score}</td>
                      <td className="px-6 py-3">
                        {a.submitted ? (
                          <Badge color="green">Submitted</Badge>
                        ) : (
                          <Badge color="amber">In Progress</Badge>
                        )}
                      </td>
                      <td className="px-6 py-3 text-sm text-slate-500 hidden md:table-cell">
                        {formatDateTime(a.submittedTime)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      <ConfirmDialog
        open={deleteQId !== null}
        onClose={() => setDeleteQId(null)}
        onConfirm={handleDeleteQuestion}
        title="Delete Question"
        message="Are you sure you want to delete this question?"
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
