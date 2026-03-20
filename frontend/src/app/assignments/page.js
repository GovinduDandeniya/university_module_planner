'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { modulesApi, assignmentsApi } from '@/lib/api';

export default function AssignmentsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [modules, setModules] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [filterModule, setFilterModule] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [form, setForm] = useState({ title: '', description: '', deadline: '', status: 'Pending', moduleId: '' });

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [mods, assigns] = await Promise.all([
        modulesApi.getAll(),
        assignmentsApi.getAll(),
      ]);
      setModules(mods);
      setAssignments(assigns);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssignments = assignments.filter((a) => {
    if (filterModule && a.moduleId !== filterModule) return false;
    if (filterStatus && a.status !== filterStatus) return false;
    return true;
  });

  const openAdd = () => {
    setEditingAssignment(null);
    setForm({ title: '', description: '', deadline: '', status: 'Pending', moduleId: modules[0]?.id || '' });
    setShowModal(true);
  };

  const openEdit = (assignment) => {
    setEditingAssignment(assignment);
    setForm({
      title: assignment.title,
      description: assignment.description,
      deadline: assignment.deadline?.split('T')[0] || '',
      status: assignment.status,
      moduleId: assignment.moduleId,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAssignment) {
        await assignmentsApi.update(editingAssignment.id, form);
      } else {
        await assignmentsApi.create(form);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this assignment?')) return;
    try {
      await assignmentsApi.delete(id);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleStatus = async (assignment) => {
    const newStatus = assignment.status === 'Pending' ? 'Submitted' : 'Pending';
    try {
      await assignmentsApi.update(assignment.id, { status: newStatus });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const formatDeadline = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getDaysLeft = (dateStr) => {
    if (!dateStr) return '';
    const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'Overdue';
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    return `${diff}d left`;
  };

  if (authLoading || !user) return null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Assignments</h1>
          <p className="page-subtitle">Track and manage your assignments</p>
        </div>
        <button className="btn-gradient" onClick={openAdd} disabled={modules.length === 0} id="add-assignment-btn">
          + Add Assignment
        </button>
      </div>

      {modules.length === 0 && !loading && (
        <div className="glass-card" style={{ padding: '20px', marginBottom: '24px', textAlign: 'center', color: 'var(--accent-amber)' }}>
          ⚠️ Add a module first before creating assignments.
        </div>
      )}

      {/* Filters */}
      <div className="filters-bar">
        <select
          className="filter-select"
          value={filterModule}
          onChange={(e) => setFilterModule(e.target.value)}
        >
          <option value="">All Modules</option>
          {modules.map((m) => (
            <option key={m.id} value={m.id}>{m.moduleCode} — {m.moduleName}</option>
          ))}
        </select>
        <select
          className="filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Submitted">Submitted</option>
        </select>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading assignments...</p>
      ) : filteredAssignments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <div className="empty-state-title">No assignments found</div>
          <div className="empty-state-text">
            {assignments.length === 0 ? 'Create your first assignment' : 'Try changing your filters'}
          </div>
        </div>
      ) : (
        <div className="assignments-list">
          {filteredAssignments.map((a, i) => (
            <div key={a.id} className="glass-card assignment-row" style={{ animationDelay: `${i * 0.03}s` }}>
              <div className="assignment-color-dot" style={{ background: a.moduleColor }} />
              <div className="assignment-info">
                <div className="assignment-title">{a.title}</div>
                <div className="assignment-meta">{a.moduleCode} · {a.moduleName}</div>
                {a.description && (
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{a.description}</div>
                )}
              </div>
              <div className="assignment-deadline">
                <div>{formatDeadline(a.deadline)}</div>
                <div style={{
                  fontSize: '12px',
                  marginTop: '2px',
                  color: getDaysLeft(a.deadline) === 'Overdue' ? 'var(--accent-rose)' : 'var(--text-muted)'
                }}>
                  {getDaysLeft(a.deadline)}
                </div>
              </div>
              <span
                className={a.status === 'Submitted' ? 'badge-submitted' : 'badge-pending'}
                style={{ cursor: 'pointer' }}
                onClick={() => toggleStatus(a)}
                title="Click to toggle status"
              >
                {a.status}
              </span>
              <div className="assignment-actions">
                <button onClick={() => openEdit(a)} title="Edit">✏️</button>
                <button onClick={() => handleDelete(a.id)} title="Delete">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">{editingAssignment ? 'Edit Assignment' : 'Add Assignment'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Title</label>
                <input
                  className="input-field"
                  placeholder="e.g., Lab Report 3"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description (optional)</label>
                <input
                  className="input-field"
                  placeholder="Brief description..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Deadline</label>
                  <input
                    type="date"
                    className="input-field"
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    className="input-field"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Submitted">Submitted</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Module</label>
                <select
                  className="input-field"
                  value={form.moduleId}
                  onChange={(e) => setForm({ ...form, moduleId: e.target.value })}
                  required
                >
                  <option value="">Select a module</option>
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>{m.moduleCode} — {m.moduleName}</option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-gradient">{editingAssignment ? 'Update' : 'Add Assignment'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
