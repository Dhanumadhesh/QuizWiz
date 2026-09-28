import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Clock,
  ArrowRight,
  ListChecks,
  CheckCircle,
} from 'lucide-react';
import { Card } from '@/components/Card';
import { Loading, ErrorBanner, PageHeader, EmptyState } from '@/components/Feedback';
import { Badge } from '@/components/Dialogs';
import { useApp } from '@/context/AppContext';
import { quizzesApi, reportsApi } from '@/services/api';
import { getErrorMessage } from '@/utils/helpers';

export default function StudentQuizList() {
  const { studentId } = useApp();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [quizList, attemptList] = await Promise.all([
        quizzesApi.list(),
        reportsApi.studentReport(studentId!).catch(() => []),
      ]);
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

  const attemptedQuizIds = new Set(attempts.map((a) => a.quizId || a.quiz?.id));
  const submittedQuizIds = new Set(
    attempts.filter((a) => a.submitted).map((a) => a.quizId || a.quiz?.id)
  );

  const filtered = quizzes.filter(
    (q) => q.title?.toLowerCase().includes(search.toLowerCase()) || false
  );

  if (loading) return <Loading label="Loading quizzes..." />;
  if (error) return <ErrorBanner message={error} onRetry={load} />;

  return (
    <div>
      <PageHeader
        title="Available Quizzes"
        subtitle={`${quizzes.length} quiz${quizzes.length !== 1 ? 'es' : ''} available`}
      />

      <div className="mb-6 relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search quizzes..."
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="p-0">
          <EmptyState
            icon={<ListChecks size={28} />}
            title={search ? 'No quizzes match your search' : 'No quizzes available'}
            description={search ? 'Try a different search term.' : 'Check back later for new quizzes.'}
          />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((q) => {
            const isSubmitted = submittedQuizIds.has(q.id);
            const isAttempted = attemptedQuizIds.has(q.id);
            return (
              <Card key={q.id} className="p-5 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white">
                    <ListChecks size={20} />
                  </div>
                  {isSubmitted ? (
                    <Badge color="green">
                      <CheckCircle size={12} className="mr-1" />
                      Completed
                    </Badge>
                  ) : isAttempted ? (
                    <Badge color="amber">In Progress</Badge>
                  ) : (
                    <Badge color="blue">Available</Badge>
                  )}
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">{q.title}</h3>
                <p className="text-sm text-slate-500 flex-1 line-clamp-2">{q.description || 'No description'}</p>
                <div className="flex items-center gap-2 mt-4 mb-4">
                  <Badge color="gray">
                    <Clock size={12} className="mr-1" />
                    {q.timeLimit} min
                  </Badge>
                </div>
                <Link
                  to={`/student/quizzes/${q.id}`}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  {isSubmitted ? 'View Result' : isAttempted ? 'Continue' : 'Start Quiz'}
                  <ArrowRight size={16} />
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
