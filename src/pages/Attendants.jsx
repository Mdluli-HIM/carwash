import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import TopBar from '../components/TopBar';
import { ArrowLeft, UserRound, Plus, Check, X } from 'lucide-react';

export default function Attendants() {
  const [attendants, setAttendants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  function loadAttendants() {
    api.get('/employees')
      .then((res) => setAttendants(res.data.filter((e) => !e.email)))
      .catch(() => setError('Could not load attendants.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadAttendants();
  }, []);

  async function addAttendant() {
    if (!newName.trim()) {
      setError('Enter a name.');
      return;
    }
    setError('');
    try {
      await api.post('/employees', { name: newName, phone: newPhone || undefined });
      setNewName('');
      setNewPhone('');
      setShowAddForm(false);
      loadAttendants();
    } catch (err) {
      setError('Could not add attendant.');
    }
  }

  function startEdit(a) {
    setEditingId(a.id);
    setEditName(a.name);
    setEditPhone(a.phone || '');
  }

  async function saveEdit(id) {
    try {
      await api.patch('/employees/' + id, { name: editName, phone: editPhone || null });
      setEditingId(null);
      loadAttendants();
    } catch (err) {
      setError('Could not update attendant.');
    }
  }

  async function toggleActive(a) {
    try {
      await api.patch('/employees/' + a.id, { active: !a.active });
      loadAttendants();
    } catch (err) {
      setError('Could not update attendant.');
    }
  }

  return (
    <div className="min-h-screen">
      <TopBar title="Attendants" />
      <div className="max-w-md mx-auto px-4 py-6">

        <Link to="/dashboard" className="flex items-center gap-1.5 text-sm text-gray-600 mb-4">
          <ArrowLeft size={15} /> Back to Dashboard
        </Link>

        {loading && <p className="text-gray-500 text-sm">Loading...</p>}
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        <div className="space-y-2 mb-4">
          {attendants.map((a) => (
            <div key={a.id} className="bg-white rounded-2xl shadow-sm p-4">
              {editingId === a.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Name"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="Phone (optional)"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(a.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-white text-sm font-medium"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                      <Check size={14} /> Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'var(--color-surface)' }}
                  >
                    <UserRound size={16} style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>
                      {a.name} {!a.active && <span className="text-xs font-normal text-gray-400">(inactive)</span>}
                    </p>
                    {a.phone && <p className="text-xs text-gray-500">{a.phone}</p>}
                  </div>
                  <button
                    onClick={() => startEdit(a)}
                    className="text-xs font-medium px-3 py-1.5 rounded-full border border-gray-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleActive(a)}
                    className={
                      'text-xs font-medium px-3 py-1.5 rounded-full ' +
                      (a.active ? 'bg-gray-100 text-gray-500' : 'text-white')
                    }
                    style={!a.active ? { backgroundColor: 'var(--color-primary)' } : {}}
                  >
                    {a.active ? 'Disable' : 'Enable'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {attendants.length === 0 && !loading && (
          <p className="text-gray-500 text-sm text-center py-4">No attendants yet.</p>
        )}

        {showAddForm ? (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-sm font-medium mb-3">New attendant</p>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Full name"
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm mb-2 outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
            <input
              type="text"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="Phone (optional)"
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm mb-3 outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
            <div className="flex gap-2">
              <button
                onClick={addAttendant}
                className="flex-1 py-2.5 rounded-lg text-white text-sm font-medium"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                Add attendant
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white border-2 border-dashed border-gray-300 text-sm font-medium text-gray-500"
          >
            <Plus size={16} /> Add an attendant
          </button>
        )}
      </div>
    </div>
  );
}
