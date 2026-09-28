import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Users, BookOpen, ArrowRight, ShieldCheck } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { studentsApi } from '@/services/api';
import { getErrorMessage } from '@/utils/helpers';

export default function LandingPage() {
  const navigate = useNavigate();
  const { setRole, setStudentId } = useApp();
  const [mode, setMode] = useState<'home' | 'faculty' | 'student'>('home');
  const [studentIdInput, setStudentIdInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFacultyLogin = () => {
    setRole('faculty');
    navigate('/faculty');
  };

  const handleStudentLogin = async () => {
    setError('');
    if (!studentIdInput.trim()) {
      setError('Please enter your Student ID.');
      return;
    }
    setLoading(true);
    try {
      await studentsApi.get(studentIdInput.trim());
      setStudentId(studentIdInput.trim());
      setRole('student');
      navigate('/student');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-violet-50 flex flex-col">
      {/* Header */}
      <header className="px-6 lg:px-12 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white shadow-lg">
            <GraduationCap size={22} />
          </div>
          <span className="text-xl font-bold text-slate-800">QuizWiz</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setMode('faculty')}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
          >
            Faculty Login
          </button>
          <button
            onClick={() => setMode('student')}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Student Login
          </button>
        </div>
      </header>

      {mode === 'home' && (
        <>
          {/* Hero */}
          <div className="flex-1 flex items-center justify-center px-6 lg:px-12">
            <div className="max-w-5xl w-full">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
                  <ShieldCheck size={16} />
                  Online Quiz Conducting System
                </div>
                <h1 className="text-4xl lg:text-6xl font-bold text-slate-800 leading-tight">
                  Assess knowledge.
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                    Empower learning.
                  </span>
                </h1>
                <p className="text-lg text-slate-500 mt-6 max-w-2xl mx-auto">
                  A complete quiz management platform for faculty and students. Create quizzes,
                  manage questions, take timed exams, and track performance — all in one place.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                  <button
                    onClick={() => setMode('faculty')}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                  >
                    Enter as Faculty
                    <ArrowRight size={18} />
                  </button>
                  <button
                    onClick={() => setMode('student')}
                    className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl border border-slate-200 shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    Enter as Student
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>

              {/* Feature cards */}
              <div className="grid sm:grid-cols-3 gap-6 mt-16">
                {[
                  {
                    icon: BookOpen,
                    title: 'Quiz Management',
                    desc: 'Create quizzes with time limits, add MCQ questions, and manage everything from one dashboard.',
                    color: 'from-blue-500 to-blue-600',
                  },
                  {
                    icon: Users,
                    title: 'Student Portal',
                    desc: 'Students browse available quizzes, take timed exams, and instantly see their scores.',
                    color: 'from-emerald-500 to-teal-600',
                  },
                  {
                    icon: ShieldCheck,
                    title: 'Reports & Analytics',
                    desc: 'View quiz-wise, student-wise, and department-wise reports with detailed attempt data.',
                    color: 'from-violet-500 to-purple-600',
                  },
                ].map((f) => {
                  const Icon = f.icon;
                  return (
                    <div
                      key={f.title}
                      className="bg-white/80 backdrop-blur rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-4`}
                      >
                        <Icon size={22} />
                      </div>
                      <h3 className="font-semibold text-slate-800 mb-1">{f.title}</h3>
                      <p className="text-sm text-slate-500">{f.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <footer className="text-center py-6 text-sm text-slate-400">
            QuizWiz — Online Quiz Conducting System
          </footer>
        </>
      )}

      {mode === 'faculty' && (
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white mb-5">
              <GraduationCap size={28} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Faculty Access</h2>
            <p className="text-sm text-slate-500 mt-1 mb-6">
              Sign in to manage quizzes, questions, students, and view reports.
            </p>
            <button
              onClick={handleFacultyLogin}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
            >
              Enter Faculty Dashboard
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => setMode('home')}
              className="w-full py-2 mt-3 text-sm text-slate-500 hover:text-slate-700 font-medium"
            >
              Back to home
            </button>
          </div>
        </div>
      )}

      {mode === 'student' && (
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white mb-5">
              <Users size={28} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Student Login</h2>
            <p className="text-sm text-slate-500 mt-1 mb-6">
              Enter your Student ID to access available quizzes.
            </p>
            {error && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 mb-4">
                <p className="text-sm text-rose-700">{error}</p>
              </div>
            )}
            <input
              type="text"
              value={studentIdInput}
              onChange={(e) => setStudentIdInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleStudentLogin()}
              placeholder="e.g. 1"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleStudentLogin}
              disabled={loading}
              className="w-full py-3 mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? 'Checking...' : 'Enter Student Portal'}
              {!loading && <ArrowRight size={18} />}
            </button>
            <button
              onClick={() => {
                setMode('home');
                setError('');
              }}
              className="w-full py-2 mt-3 text-sm text-slate-500 hover:text-slate-700 font-medium"
            >
              Back to home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
