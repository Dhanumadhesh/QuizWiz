import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BarChart3,
  ClipboardList,
  Search,
  TrendingUp,
  Award,
  Building2,
} from 'lucide-react';
import { Card, StatCard } from '@/components/Card';
import { Loading, ErrorBanner, PageHeader, EmptyState } from '@/components/Feedback';
import { Badge } from '@/components/Dialogs';
import { reportsApi, quizzesApi, studentsApi } from '@/services/api';
import { getErrorMessage, formatDateTime } from '@/utils/helpers';

type ReportType = 'all' | 'quiz' | 'student' | 'department';

export default function Reports() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialType = (searchParams.get('quizId') ? 'quiz' : 'all') as ReportType;
  const [type, setType] = useState<ReportType>(initialType);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [quizId, setQuizId] = useState(searchParams.get('quizId') || '');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [allAttempts, quizList, studentList] = await Promise.all([
        reportsApi.allAttempts(),
        quizzesApi.list().catch(() => []),
        studentsApi.list().catch(() => []),
      ]);
      setAttempts(Array.isArray(allAttempts) ? allAttempts : []);
      setQuizzes(Array.isArray(quizList) ? quizList : []);
      setStudents(Array.isArray(studentList) ? studentList : []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Fetch filtered report
  const [reportData, setReportData] = useState<any[] | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState('');

  const fetchReport = async (t: ReportType, id?: string) => {
    setReportLoading(true);
    setReportError('');
    setReportData(null);
    try {
      let data: any[];
      if (t === 'all') {
        data = await reportsApi.allAttempts();
      } else if (t === 'quiz') {
        data = await reportsApi.quizReport(id || quizId);
      } else if (t === 'student') {
        data = await reportsApi.studentReport(id || studentId);
      } else {
        data = await reportsApi.departmentReport(id || department);
      }
      setReportData(Array.isArray(data) ? data : []);
    } catch (err) {
      setReportError(getErrorMessage(err));
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    if (type === 'all') {
      fetchReport('all');
    } else if (type === 'quiz' && quizId) {
      fetchReport('quiz', quizId);
    } else if (type === 'student' && studentId) {
      fetchReport('student', studentId);
    } else if (type === 'department' && department) {
      fetchReport('department', department);
    } else {
      setReportData(null);
    }
  }, [type, quizId, studentId, department]);

  const displayData = reportData || (type === 'all' ? attempts : []);
  const submittedCount = displayData.filter((a) => a.submitted).length;
  const avgScore =
    submittedCount > 0
      ? (displayData.filter((a) => a.submitted).reduce((s, a) => s + (a.score || 0), 0) / submittedCount).toFixed(1)
      : '—';

  const filtered = displayData.filter(
    (a) =>
      a.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      a.quizTitle?.toLowerCase().includes(search.toLowerCase()) ||
      a.department?.toLowerCase().includes(search.toLowerCase())
  );

  const departments = [...new Set(students.map((s) => s.department).filter(Boolean))];

  if (loading) return <Loading label="Loading reports..." />;
  if (error) return <ErrorBanner message={error} onRetry={load} />;

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        subtitle="View quiz-wise, student-wise, and department-wise reports"
      />

      {/* Report type tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'all' as ReportType, label: 'All Attempts', icon: ClipboardList },
          { key: 'quiz' as ReportType, label: 'Quiz Report', icon: BarChart3 },
          { key: 'student' as ReportType, label: 'Student Report', icon: TrendingUp },
          { key: 'department' as ReportType, label: 'Department Report', icon: Building2 },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setType(tab.key);
                setReportData(null);
                setSearch('');
              }}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors ${
                type === tab.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filter selectors */}
      {type === 'quiz' && (
        <div className="mb-4">
          <select
            value={quizId}
            onChange={(e) => setQuizId(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-64"
          >
            <option value="">Select a quiz...</option>
            {quizzes.map((q) => (
              <option key={q.id} value={q.id}>
                {q.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {type === 'student' && (
        <div className="mb-4">
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-64"
          >
            <option value="">Select a student...</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} (#{s.id})
              </option>
            ))}
          </select>
        </div>
      )}

      {type === 'department' && (
        <div className="mb-4">
          {departments.length > 0 ? (
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-64"
            >
              <option value="">Select a department...</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Enter department name..."
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>
      )}

      {reportError && (
        <div className="mb-4">
          <ErrorBanner message={reportError} />
        </div>
      )}

      {/* Summary cards */}
      {displayData.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Attempts" value={displayData.length} icon={<ClipboardList size={22} />} color="blue" />
          <StatCard label="Submitted" value={submittedCount} icon={<TrendingUp size={22} />} color="green" />
          <StatCard label="In Progress" value={displayData.length - submittedCount} icon={<BarChart3 size={22} />} color="amber" />
          <StatCard label="Avg Score" value={avgScore} icon={<Award size={22} />} color="purple" />
        </div>
      )}

      {/* Search */}
      {displayData.length > 0 && (
        <div className="mb-4 relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search attempts..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Report table */}
      {reportLoading ? (
        <Loading label="Fetching report..." />
      ) : (type === 'all' || (type !== 'all' && reportData !== null)) ? (
        filtered.length === 0 ? (
          <Card className="p-0">
            <EmptyState
              icon={<BarChart3 size={28} />}
              title="No attempts found"
              description={
                type === 'all'
                  ? 'No quiz attempts have been made yet.'
                  : type === 'quiz'
                  ? 'No attempts for this quiz yet.'
                  : type === 'student'
                  ? 'This student has not attempted any quizzes.'
                  : 'No attempts from this department yet.'
              }
            />
          </Card>
        ) : (
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Student</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 hidden md:table-cell">Department</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Quiz</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Score</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Status</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 hidden lg:table-cell">Started</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 hidden lg:table-cell">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3 text-sm font-medium text-slate-800">{a.studentName}</td>
                      <td className="px-6 py-3 hidden md:table-cell">
                        {a.department && <Badge color="blue">{a.department}</Badge>}
                      </td>
                      <td className="px-6 py-3 text-sm text-slate-600">{a.quizTitle}</td>
                      <td className="px-6 py-3 text-sm font-semibold text-slate-700">
                        {a.submitted ? a.score : '—'}
                      </td>
                      <td className="px-6 py-3">
                        {a.submitted ? (
                          <Badge color="green">Submitted</Badge>
                        ) : (
                          <Badge color="amber">In Progress</Badge>
                        )}
                      </td>
                      <td className="px-6 py-3 text-sm text-slate-500 hidden lg:table-cell">
                        {formatDateTime(a.startTime)}
                      </td>
                      <td className="px-6 py-3 text-sm text-slate-500 hidden lg:table-cell">
                        {formatDateTime(a.submittedTime)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )
      ) : (
        <Card className="p-0">
          <EmptyState
            icon={<BarChart3 size={28} />}
            title="Select a filter"
            description={
              type === 'quiz'
                ? 'Choose a quiz to view its report.'
                : type === 'student'
                ? 'Choose a student to view their report.'
                : 'Enter or select a department to view its report.'
            }
          />
        </Card>
      )}
    </div>
  );
}
