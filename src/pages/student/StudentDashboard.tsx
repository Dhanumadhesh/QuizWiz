import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ListChecks,
  ClipboardList,
  Award,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Card, StatCard } from '@/components/Card';
import { Loading, ErrorBanner, PageHeader, EmptyState } from '@/components/Feedback';
import { Badge } from '@/components/Dialogs';
import { useApp } from '@/context/AppContext';
import { quizzesApi, reportsApi, studentsApi } from '@/services/api';
import { getErrorMessage, formatDateTime } from '@/utils/helpers';

export default function StudentDashboard() {
  const { studentId } = useApp();
  const [student, setStudent] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [studentData, quizList, attemptList] = await Promise.all([
        studentsApi.get(studentId!),
        quizzesApi.list().catch(() => []),
        reportsApi.studentReport(studentId!).catch(() => []),
      ]);
      setStudent(studentData);
      setQuizzes(Array.isArray(quizList) ? quizList : []);
      setAttempts(Array.isArray(attemptList) ? attemptList : []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [studentId]);

  if (loading) return <Loading label="Loading your dashboard..." />;
  if (error) return <ErrorBanner message={error} onRetry={load} />;

  const completedAttempts = attempts.filter((a) => a.submitted);
  const avgScore =
    completedAttempts.length > 0
      ? (completedAttempts.reduce((s, a) => s + (a.score || 0), 0) / completedAttempts.length).toFixed(1)
      : '—';
  const attemptedQuizIds = new Set(attempts.map((a) => a.quizId || a.quiz?.id));

  return (
    <div>
      <PageHeader
        title={`Welcome, ${student?.name || 'Student'}`}
        subtitle={student?.department || ''}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Available Quizzes" value={quizzes.length} icon={<ListChecks size={22} />} color="blue" />
        <StatCard label="Completed" value={completedAttempts.length} icon={<ClipboardList size={22} />} color="green" />
        <StatCard label="Average Score" value={avgScore} icon={<Award size={22} />} color="amber" />
        <StatCard label="In Progress" value={attempts.length - completedAttempts.length} icon={<Clock size={22} />} color="purple" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Available quizzes */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <ListChecks size={18} className="text-blue-600" />
              Available Quizzes
            </h3>
            <Link to="/student/quizzes" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {quizzes.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">No quizzes available.</p>
          ) : (
            <div className="space-y-2">
              {quizzes.slice(0, 5).map((q) => {
                const attempted = attemptedQuizIds.has(q.id);
                return (
                  <Link
                    key={q.id}
                    to={`/student/quizzes/${q.id}`}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{q.title}</p>
                      <p className="text-xs text-slate-400">{q.timeLimit} min</p>
                    </div>
                    {attempted ? (
                      <Badge color="green">Done</Badge>
                    ) : (
                      <ArrowRight size={16} className="text-slate-300 flex-shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </Card>

        {/* Recent results */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <TrendingUp size={18} className="text-amber-600" />
              Your Results
            </h3>
          </div>
          {completedAttempts.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">No completed quizzes yet.</p>
          ) : (
            <div className="space-y-2">
              {completedAttempts.slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{a.quizTitle}</p>
                    <p className="text-xs text-slate-400">{formatDateTime(a.submittedTime)}</p>
                  </div>
                  <Badge color="green">Score: {a.score}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
