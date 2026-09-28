import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Card } from '@/components/Card';
import { ErrorBanner } from '@/components/Feedback';
import { quizzesApi } from '@/services/api';
import { getErrorMessage } from '@/utils/helpers';

export default function QuizForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetchLoading, setFetchLoading] = useState(isEdit);

  if (isEdit && fetchLoading) {
    quizzesApi
      .get(id!)
      .then((data) => {
        setTitle(data.title || '');
        setDescription(data.description || '');
        setTimeLimit(String(data.timeLimit || ''));
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setFetchLoading(false));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) {
      setError('Please enter a quiz title.');
      return;
    }
    if (!timeLimit || Number(timeLimit) <= 0) {
      setError('Please enter a valid time limit.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        timeLimit: Number(timeLimit),
      };
      if (isEdit) {
        await quizzesApi.update(id!, payload);
      } else {
        await quizzesApi.create(payload);
      }
      navigate('/faculty/quizzes');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <button
        onClick={() => navigate('/faculty/quizzes')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4"
      >
        <ArrowLeft size={16} />
        Back to quizzes
      </button>

      <h1 className="text-2xl font-bold text-slate-800 mb-6">
        {isEdit ? 'Edit Quiz' : 'Create New Quiz'}
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
              Quiz Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Data Structures Final Exam"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Brief description of the quiz..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Time Limit (minutes) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              value={timeLimit}
              onChange={(e) => setTimeLimit(e.target.value)}
              min="1"
              placeholder="e.g. 30"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/faculty/quizzes')}
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
              {loading ? 'Saving...' : isEdit ? 'Update Quiz' : 'Create Quiz'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
