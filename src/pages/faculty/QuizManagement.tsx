import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  HelpCircle,
  BarChart3,
  FileQuestion,
} from 'lucide-react';
import { Card } from '@/components/Card';
import { Loading, ErrorBanner, PageHeader, EmptyState } from '@/components/Feedback';
import { ConfirmDialog, Badge } from '@/components/Dialogs';
import { quizzesApi, questionsApi } from '@/services/api';
import { getErrorMessage } from '@/utils/helpers';

export default function QuizManagement() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [quizList, questionList] = await Promise.all([
        quizzesApi.list(),
        questionsApi.list().catch(() => []),
      ]);
      setQuizzes(Array.isArray(quizList) ? quizList : []);
      setAllQuestions(Array.isArray(questionList) ? questionList : []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async () => {
    if (deleteId === null) return;
    setDeleteError('');
    try {
      await quizzesApi.remove(deleteId);
      setDeleteId(null);
      load();
    } catch (err) {
      setDeleteError(getErrorMessage(err));
    }
  };

  const filtered = quizzes.filter(
    (q) =>
      q.title?.toLowerCase().includes(search.toLowerCase()) ||
      q.description?.toLowerCase().includes(search.toLowerCase())
  );

  const questionCount = (quizId: number) =>
    allQuestions.filter((q) => q.quizId === quizId).length;

  if (loading) return <Loading label="Loading quizzes..." />;
  if (error) return <ErrorBanner message={error} onRetry={load} />;

  return (
    <div>
      <PageHeader
        title="Quiz Management"
        subtitle={`${quizzes.length} quiz${quizzes.length !== 1 ? 's' : ''} total`}
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

      {deleteError && (
        <div className="mb-4">
          <ErrorBanner message={deleteError} />
        </div>
      )}

      <div className="mb-4 relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search quizzes by title or description..."
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="p-0">
          <EmptyState
            icon={<FileQuestion size={28} />}
            title={search ? 'No quizzes match your search' : 'No quizzes yet'}
            description={search ? 'Try a different search term.' : 'Create your first quiz to get started.'}
            action={
              !search && (
                <Link
                  to="/faculty/quizzes/new"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-colors"
                >
                  <Plus size={16} />
                  Create Quiz
                </Link>
              )
            }
          />
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">ID</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Title</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 hidden md:table-cell">Description</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Time</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 hidden lg:table-cell">Questions</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 text-sm text-slate-400">#{q.id}</td>
                    <td className="px-6 py-3">
                      <p className="text-sm font-medium text-slate-800">{q.title}</p>
                    </td>
                    <td className="px-6 py-3 hidden md:table-cell">
                      <p className="text-sm text-slate-500 max-w-xs truncate">{q.description || '—'}</p>
                    </td>
                    <td className="px-6 py-3">
                      <Badge color="blue">{q.timeLimit} min</Badge>
                    </td>
                    <td className="px-6 py-3 hidden lg:table-cell">
                      <Badge color="gray">{questionCount(q.id)} Qs</Badge>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/faculty/quizzes/${q.id}`}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          to={`/faculty/quizzes/${q.id}/edit`}
                          className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </Link>
                        <Link
                          to={`/faculty/questions?quizId=${q.id}`}
                          className="p-2 text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                          title="Add Questions"
                        >
                          <HelpCircle size={16} />
                        </Link>
                        <Link
                          to={`/faculty/reports?quizId=${q.id}`}
                          className="p-2 text-slate-500 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                          title="View Report"
                        >
                          <BarChart3 size={16} />
                        </Link>
                        <button
                          onClick={() => {
                            setDeleteError('');
                            setDeleteId(q.id);
                          }}
                          className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Quiz"
        message="Are you sure you want to delete this quiz? This action cannot be undone."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
