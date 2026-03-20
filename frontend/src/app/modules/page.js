'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { modulesApi } from '@/lib/api';

const COLOR_OPTIONS = [
  '#8b5cf6', '#3b82f6', '#14b8a6', '#22c55e',
  '#f59e0b', '#f43f5e', '#ec4899', '#6366f1',
  '#06b6d4', '#84cc16',
];

export default function ModulesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [form, setForm] = useState({ moduleName: '', moduleCode: '', semester: '', colorTag: '#8b5cf6' });

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) loadModules();
  }, [user]);

  const loadModules = async () => {
    try {
      const data = await modulesApi.getAll();
      setModules(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingModule(null);
    setForm({ moduleName: '', moduleCode: '', semester: '', colorTag: '#8b5cf6' });
    setShowModal(true);
  };

  const openEdit = (mod) => {
    setEditingModule(mod);
    setForm({ moduleName: mod.moduleName, moduleCode: mod.moduleCode, semester: mod.semester, colorTag: mod.colorTag });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingModule) {
        await modulesApi.update(editingModule.id, form);
      } else {
        await modulesApi.create(form);
      }
      setShowModal(false);
      loadModules();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this module and all its assignments?')) return;
    try {
      await modulesApi.delete(id);
      loadModules();
    } catch (err) {
      alert(err.message);
    }
  };

  if (authLoading || !user) return null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Modules</h1>
          <p className="page-subtitle">Manage your university modules</p>
        </div>
        <button className="btn-gradient" onClick={openAdd} id="add-module-btn">
          + Add Module
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading modules...</p>
      ) : modules.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <div className="empty-state-title">No modules yet</div>
          <div className="empty-state-text">Add your first module to get started</div>
        </div>
      ) : (
        <div className="modules-grid">
          {modules.map((mod, i) => (
            <div
              key={mod.id}
              className="glass-card module-card"
              style={{ animationDelay: `${i * 0.05}s`, '--module-color': mod.colorTag }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: mod.colorTag, borderRadius: '16px 16px 0 0' }} />
              <div className="module-card-header">
                <div>
                  <div className="module-card-name">{mod.moduleName}</div>
                  <div className="module-card-code" style={{ color: mod.colorTag }}>{mod.moduleCode}</div>
                </div>
                <div className="module-card-actions">
                  <button onClick={() => openEdit(mod)} title="Edit">✏️</button>
                  <button onClick={() => handleDelete(mod.id)} title="Delete">🗑️</button>
                </div>
              </div>
              {mod.semester && (
                <div className="module-card-semester">📅 {mod.semester}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">{editingModule ? 'Edit Module' : 'Add Module'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Module Name</label>
                <input
                  className="input-field"
                  placeholder="e.g., Algorithms & Data Structures"
                  value={form.moduleName}
                  onChange={(e) => setForm({ ...form, moduleName: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Module Code</label>
                  <input
                    className="input-field"
                    placeholder="e.g., CS201"
                    value={form.moduleCode}
                    onChange={(e) => setForm({ ...form, moduleCode: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Semester</label>
                  <input
                    className="input-field"
                    placeholder="e.g., Semester 1"
                    value={form.semester}
                    onChange={(e) => setForm({ ...form, semester: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Color Tag</label>
                <div className="color-options">
                  {COLOR_OPTIONS.map((color) => (
                    <div
                      key={color}
                      className={`color-option ${form.colorTag === color ? 'selected' : ''}`}
                      style={{ background: color }}
                      onClick={() => setForm({ ...form, colorTag: color })}
                    />
                  ))}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-gradient">{editingModule ? 'Update' : 'Add Module'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
