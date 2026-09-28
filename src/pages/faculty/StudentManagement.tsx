import { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Users,
  Eye,
} from 'lucide-react';
import { Card } from '@/components/Card';
import { Loading, ErrorBanner, PageHeader, EmptyState } from '@/components/Feedback';
import { ConfirmDialog, Badge } from '@/components/Dialogs';
import { Modal } from '@/components/Modal';
import { studentsApi, reportsApi } from '@/services/api';
import { getErrorMessage, formatDateTime } from '@/utils/helpers';

export default function StudentManagement() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', department: '' });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [viewStudent, setViewStudent] = useState<any>(null);
  const [studentReport, setStudentReport] = useState<any[]>([]);
  const [reportLoading, setReportLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await studentsApi.list();
      setStudents(Array.isArray(data) ? data : []);
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
      await studentsApi.remove(deleteId);
      setDeleteId(null);
      load();
    } catch (err) {
      setDeleteError(getErrorMessage(err));
    }
  };

  const openCreate = () => {
    setEditId(null);
    setFormData({ name: '', department: '' });
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (student: any) => {
    setEditId(student.id);
    setFormData({ name: student.name || '', department: student.department || '' });
    setFormError('');
    setShowForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!formData.name.trim()) {
      setFormError('Please enter the student name.');
      return;
    }
    if (!formData.department.trim()) {
      setFormError('Please enter the department.');
      return;
    }
    setFormLoading(true);
    try {
      const payload = { name: formData.name.trim(), department: formData.department.trim() };
      if (editId !== null) {
        await studentsApi.update(editId, payload);
      } else {
        await studentsApi.create(payload);
      }
      setShowForm(false);
      load();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setFormLoading(false);
    }
  };

  const handleView = async (student: any) => {
    setViewStudent(student);
    setStudentReport([]);
    setReportLoading(true);
    try {
      const data = await reportsApi.studentReport(student.id);
      setStudentReport(Array.isArray(data) ? data : []);
    } catch (err) {
      setStudentReport([]);
    } finally {
      setReportLoading(false);
    }
  };

  const filtered = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.department?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loading label="Loading students..." />;
  if (error) return <ErrorBanner message={error} onRetry={load} />;

  return (
    <div>
      <PageHeader
        title="Student Management"
        subtitle={`${students.length} student${students.length !== 1 ? 's' : ''} total`}
        action={
          <button
            onClick={openCreate}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm flex items-center gap-2 transition-colors"
          >
            <Plus size={18} />
            Add Student
          </button>
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
          placeholder="Search by name or department..."
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="p-0">
          <EmptyState
            icon={<Users size={28} />}
            title={search ? 'No students match your search' : 'No students yet'}
            description={search ? 'Try a different search term.' : 'Add your first student.'}
            action={
              !search && (
                <button
                  onClick={openCreate}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-colors"
                >
                  <Plus size={16} />
                  Add Student
                </button>
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
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Name</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Department</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 text-sm text-slate-400">#{s.id}</td>
                    <td className="px-6 py-3">
                      <p className="text-sm font-medium text-slate-800">{s.name}</p>
                    </td>
                    <td className="px-6 py-3">
                      <Badge color="blue">{s.department}</Badge>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleView(s)}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => openEdit(s)}
                          className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteError('');
                            setDeleteId(s.id);
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

      {/* Create/Edit Modal */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editId !== null ? 'Edit Student' : 'Add New Student'}
        size="sm"
      >
        {formError && (
          <div className="mb-4">
            <ErrorBanner message={formError} />
          </div>
        )}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Student Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. John Doe"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Department <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              placeholder="e.g. Computer Science"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-60"
            >
              {formLoading ? 'Saving...' : editId !== null ? 'Update' : 'Add Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Student Modal */}
      <Modal
        open={!!viewStudent}
        onClose={() => setViewStudent(null)}
        title="Student Details"
        size="lg"
      >
        {viewStudent && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xl font-bold">
                {viewStudent.name?.charAt(0)?.toUpperCase() || 'S'}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">{viewStudent.name}</h3>
                <Badge color="blue">{viewStudent.department}</Badge>
              </div>
            </div>

            <h4 className="text-sm font-semibold text-slate-700 mb-3">Quiz History</h4>
            {reportLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
              </div>
            ) : studentReport.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">No quiz attempts yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-2">Quiz</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-2">Score</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-2">Status</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-2 hidden sm:table-cell">Submitted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentReport.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50">
                        <td className="px-4 py-2 text-sm font-medium text-slate-700">{a.quizTitle}</td>
                        <td className="px-4 py-2 text-sm text-slate-600">{a.score}</td>
                        <td className="px-4 py-2">
                          {a.submitted ? (
                            <Badge color="green">Submitted</Badge>
                          ) : (
                            <Badge color="amber">In Progress</Badge>
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm text-slate-500 hidden sm:table-cell">
                          {formatDateTime(a.submittedTime)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Student"
        message="Are you sure you want to delete this student? This will also remove their attempt records."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
