import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Card } from '@/components/Card';
import { ErrorBanner } from '@/components/Feedback';
import { questionsApi, quizzesApi } from '@/services/api';
import { getErrorMessage } from '@/utils/helpers';

export default function QuestionForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const presetQuizId = searchParams.get('quizId');
  const isEdit = !!id;
  const navigate = useNavigate();

  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [quizId, setQuizId] = useState(presetQuizId || '');
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [quizLoading, setQuizLoading] = useState(true);

  useEffect(() => {
    quizzesApi
      .list()
      .then((data) => {
        setQuizzes(Array.isArray(data) ? data : []);
        if (!presetQuizId && !isEdit && data.length > 0) {
          setQuizId(String(data[0].id));
        }
      })
      .catch(() => {})
      .finally(() => setQuizLoading(false));
  }, []);

  useEffect(() => {
    if (isEdit) {
      questionsApi
        .get(id!)
        .then((data) => {
          setQuestionText(data.questionText || '');
          setOptionA(data.optionA || '');
          setOptionB(data.optionB || '');
          setOptionC(data.optionC || '');
          setOptionD(data.optionD || '');
          setCorrectAnswer(data.correctAnswer || '');
          setQuizId(String(data.quizId));
        })
        .catch((err) => setError(getErrorMessage(err)))
        .finally(() => setFetchLoading(false));
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!questionText.trim()) {
      setError('Please enter the question text.');
      return;
    }
    if (!optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
      setError('All four options are required.');
      return;
    }
    if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
      setError('Please select the correct answer (A, B, C, or D).');
      return;
    }
    if (!quizId) {
      setError('Please select a quiz.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        questionText: questionText.trim(),
        optionA: optionA.trim(),
        optionB: optionB.trim(),
        optionC: optionC.trim(),
        optionD: optionD.trim(),
        correctAnswer,
        quizId: Number(quizId),
      };
      if (isEdit) {
        await questionsApi.update(id!, payload);
      } else {
        await questionsApi.create(payload);
      }
      navigate(presetQuizId ? `/faculty/quizzes/${presetQuizId}` : '/faculty/questions');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading || quizLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="max-w-2xl">
        <button
          onClick={() => navigate('/faculty/questions')}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4"
        >
          <ArrowLeft size={16} />
          Back to questions
        </button>
        <Card className="p-8 text-center">
          <p className="text-slate-600 font-medium">You need to create a quiz first before adding questions.</p>
          <button
            onClick={() => navigate('/faculty/quizzes/new')}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl"
          >
            Create Quiz
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <button
        onClick={() => navigate(presetQuizId ? `/faculty/quizzes/${presetQuizId}` : '/faculty/questions')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <h1 className="text-2xl font-bold text-slate-800 mb-6">
        {isEdit ? 'Edit Question' : 'Add New Question'}
      </h1>

      {error && (
        <div className="mb-4">
          <ErrorBanner message={error} />
        </div>
      )}

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Quiz <span className="text-rose-500">*</span>
            </label>
            <select
              value={quizId}
              onChange={(e) => setQuizId(e.target.value)}
              disabled={!!presetQuizId && !isEdit}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:bg-slate-50"
            >
              {quizzes.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Question Text <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              rows={3}
              placeholder="Enter the question..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: 'Option A', val: optionA, set: setOptionA, letter: 'A' },
              { label: 'Option B', val: optionB, set: setOptionB, letter: 'B' },
              { label: 'Option C', val: optionC, set: setOptionC, letter: 'C' },
              { label: 'Option D', val: optionD, set: setOptionD, letter: 'D' },
            ].map((opt) => (
              <div key={opt.letter}>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {opt.label} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={opt.val}
                  onChange={(e) => opt.set(e.target.value)}
                  placeholder={`Option ${opt.letter} text`}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Correct Answer <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-4 gap-3">
              {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setCorrectAnswer(opt)}
                  className={`py-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                    correctAnswer === opt
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(presetQuizId ? `/faculty/quizzes/${presetQuizId}` : '/faculty/questions')}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm flex items-center gap-2 transition-colors disabled:opacity-60"
            >
              <Save size={16} />
              {loading ? 'Saving...' : isEdit ? 'Update Question' : 'Add Question'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
