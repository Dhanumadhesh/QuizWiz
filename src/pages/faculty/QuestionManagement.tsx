import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  HelpCircle,
  Filter,
} from 'lucide-react';
import { Card } from '@/components/Card';
import {
  Loading,
  ErrorBanner,
  PageHeader,
  EmptyState,
} from '@/components/Feedback';
import { ConfirmDialog, Badge } from '@/components/Dialogs';
import { questionsApi, quizzesApi } from '@/services/api';
import { getErrorMessage } from '@/utils/helpers';

export default function QuestionManagement() {
  const [searchParams] = useSearchParams();

  const quizFilter = searchParams.get('quizId');

  const [questions, setQuestions] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterQuiz, setFilterQuiz] = useState(quizFilter || '');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState('');

  // =====================================================
  // Load questions and quizzes
  // =====================================================

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const [questionList, quizList] = await Promise.all([
        questionsApi.list(),
        quizzesApi.list().catch(() => []),
      ]);

      setQuestions(
        Array.isArray(questionList) ? questionList : []
      );

      setQuizzes(
        Array.isArray(quizList) ? quizList : []
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // =====================================================
  // Delete question
  // =====================================================

  const handleDelete = async () => {
    if (deleteId === null) return;

    setDeleteError('');

    try {
      await questionsApi.remove(deleteId);

      setDeleteId(null);

      await load();
    } catch (err) {
      setDeleteError(getErrorMessage(err));
    }
  };

  // =====================================================
  // Get Quiz ID from question
  //
  // Backend may return:
  // {
  //   quiz: {
  //     id: 1
  //   }
  // }
  //
  // or:
  //
  // {
  //   quizId: 1
  // }
  // =====================================================

  const getQuizId = (question: any): number | null => {
    if (question?.quizId !== undefined && question?.quizId !== null) {
      return Number(question.quizId);
    }

    if (
      question?.quiz?.id !== undefined &&
      question?.quiz?.id !== null
    ) {
      return Number(question.quiz.id);
    }

    return null;
  };

  // =====================================================
  // Get Quiz title
  // =====================================================

  const quizTitle = (qid: number | null) => {
    if (qid === null) {
      return 'Quiz not assigned';
    }

    const quiz = quizzes.find(
      (q) => Number(q.id) === Number(qid)
    );

    return quiz?.title || `Quiz #${qid}`;
  };

  // =====================================================
  // Filter questions
  // =====================================================

  const filtered = questions.filter((q) => {
    const matchSearch =
      q.questionText
        ?.toLowerCase()
        .includes(search.toLowerCase()) || false;

    const questionQuizId = getQuizId(q);

    const matchQuiz =
      !filterQuiz ||
      questionQuizId === Number(filterQuiz);

    return matchSearch && matchQuiz;
  });

  // =====================================================
  // Loading
  // =====================================================

  if (loading) {
    return <Loading label="Loading questions..." />;
  }

  // =====================================================
  // Error
  // =====================================================

  if (error) {
    return (
      <ErrorBanner
        message={error}
        onRetry={load}
      />
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div>
      <PageHeader
        title="Question Management"
        subtitle={`${questions.length} question${
          questions.length !== 1 ? 's' : ''
        } total`}
        action={
          <Link
            to={`/faculty/questions/new${
              filterQuiz ? `?quizId=${filterQuiz}` : ''
            }`}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm flex items-center gap-2 transition-colors"
          >
            <Plus size={18} />
            Add Question
          </Link>
        }
      />

      {/* Delete Error */}

      {deleteError && (
        <div className="mb-4">
          <ErrorBanner message={deleteError} />
        </div>
      )}

      {/* Search and Filter */}

      <div className="flex flex-col sm:flex-row gap-3 mb-4">

        {/* Search */}

        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Quiz Filter */}

        <div className="relative">
          <Filter
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <select
            value={filterQuiz}
            onChange={(e) => setFilterQuiz(e.target.value)}
            className="pl-10 pr-8 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">
              All Quizzes
            </option>

            {quizzes.map((q) => (
              <option
                key={q.id}
                value={q.id}
              >
                {q.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* No Questions */}

      {filtered.length === 0 ? (
        <Card className="p-0">
          <EmptyState
            icon={<HelpCircle size={28} />}
            title={
              search || filterQuiz
                ? 'No questions match your filters'
                : 'No questions yet'
            }
            description={
              search || filterQuiz
                ? 'Try different filters.'
                : 'Add your first MCQ question.'
            }
            action={
              !search &&
              !filterQuiz && (
                <Link
                  to="/faculty/questions/new"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-colors"
                >
                  <Plus size={16} />
                  Add Question
                </Link>
              )
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">

          {filtered.map((q, idx) => {

            // Get quiz ID safely
            const questionQuizId = getQuizId(q);

            return (
              <Card
                key={q.id}
                className="p-5"
              >
                <div className="flex items-start justify-between gap-4">

                  <div className="flex-1 min-w-0">

                    {/* Question Header */}

                    <div className="flex items-center gap-2 mb-2 flex-wrap">

                      <span className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </span>

                      <Badge color="blue">
                        {quizTitle(questionQuizId)}
                      </Badge>

                      <Badge color="green">
                        Correct: {q.correctAnswer}
                      </Badge>

                    </div>

                    {/* Question */}

                    <p className="text-sm font-medium text-slate-800 mb-3">
                      {q.questionText}
                    </p>

                    {/* Options */}

                    <div className="grid sm:grid-cols-2 gap-2">

                      {(['A', 'B', 'C', 'D'] as const).map(
                        (opt) => (
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
                        )
                      )}

                    </div>
                  </div>

                  {/* Actions */}

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
                        setDeleteId(q.id);
                      }}
                      className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>
                </div>
              </Card>
            );
          })}

        </div>
      )}

      {/* Delete Confirmation */}

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Question"
        message="Are you sure you want to delete this question?"
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}