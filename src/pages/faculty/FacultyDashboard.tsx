import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FileQuestion,
  HelpCircle,
  ClipboardList,
  Plus,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Card, StatCard } from '@/components/Card';
import { Loading, ErrorBanner, PageHeader } from '@/components/Feedback';
import { studentsApi, quizzesApi, questionsApi, reportsApi } from '@/services/api';
import { getErrorMessage, formatDateTime } from '@/utils/helpers';

interface AttemptReport {
  id: number;
  studentName: string;
  quizTitle: string;
  score: number;
  submitted: boolean;
  startTime: string;
  submittedTime?: string;
}

export default function FacultyDashboard() {
  const [stats, setStats] = useState({ students: 0, quizzes: 0, questions: 0, attempts: 0 });
  const [recentQuizzes, setRecentQuizzes] = useState<any[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<AttemptReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [students, quizzes, questions, attempts] = await Promise.all([
        studentsApi.list().catch(() => []),
        quizzesApi.list().catch(() => []),
        questionsApi.list().catch(() => []),
        reportsApi.allAttempts().catch(() => []),
      ]);
      setStats({
        students: Array.isArray(students) ? students.length : 0,
        quizzes: Array.isArray(quizzes) ? quizzes.length : 0,
        questions: Array.isArray(questions) ? questions.length : 0,
        attempts: Array.isArray(attempts) ? attempts.length : 0,
      });
      setRecentQuizzes((Array.isArray(quizzes) ? quizzes : []).slice(0, 5));
      setRecentAttempts((Array.isArray(attempts) ? attempts : []).slice(0, 5));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <Loading label="Loading dashboard..." />;
  if (error) return <ErrorBanner message={error} onRetry={load} />;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of quizzes, students, and activity"
        action={
          <Link
            to="/faculty/quizzes/new"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm flex items-center gap-2 transition-colors"
          >
            <Plus size={18} />
            New Quiz
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Students" value={stats.students} icon={<Users size={22} />} color="blue" />
        <StatCard label="Total Quizzes" value={stats.quizzes} icon={<FileQuestion size={22} />} color="purple" />
        <StatCard label="Total Questions" value={stats.questions} icon={<HelpCircle size={22} />} color="cyan" />
        <StatCard label="Total Attempts" value={stats.attempts} icon={<ClipboardList size={22} />} color="amber" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Quizzes */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <FileQuestion size={18} className="text-blue-600" />
              Recent Quizzes
            </h3>
            <Link to="/faculty/quizzes" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {recentQuizzes.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">No quizzes yet.</p>
          ) : (
            <div className="space-y-2">
              {recentQuizzes.map((q) => (
                <Link
                  key={q.id}
                  to={`/faculty/quizzes/${q.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{q.title}</p>
                    <p className="text-xs text-slate-400">{q.timeLimit} min</p>
                  </div>
                  <ArrowRight size={16} className="text-slate-300 flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Attempts */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <TrendingUp size={18} className="text-amber-600" />
              Recent Attempts
            </h3>
            <Link to="/faculty/reports" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {recentAttempts.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">No attempts yet.</p>
          ) : (
            <div className="space-y-2">
              {recentAttempts.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{a.studentName}</p>
                    <p className="text-xs text-slate-400 truncate">{a.quizTitle}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        a.submitted
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {a.submitted ? `Score: ${a.score}` : 'In progress'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-6">
        <h3 className="font-semibold text-slate-800 mb-3">Quick Actions</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { to: '/faculty/quizzes/new', label: 'Create Quiz', icon: FileQuestion, color: 'blue' },
            { to: '/faculty/questions/new', label: 'Add Question', icon: HelpCircle, color: 'cyan' },
            { to: '/faculty/students/new', label: 'Add Student', icon: Users, color: 'emerald' },
            { to: '/faculty/reports', label: 'View Reports', icon: TrendingUp, color: 'amber' },
          ].map((a) => {
            const Icon = a.icon;
            return (
              <Link
                key={a.to}
                to={a.to}
                className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:border-blue-200 transition-all group"
              >
                <div className={`w-10 h-10 rounded-xl bg-${a.color}-50 text-${a.color}-600 flex items-center justify-center mb-3`}>
                  <Icon size={20} />
                </div>
                <p className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">
                  {a.label}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
