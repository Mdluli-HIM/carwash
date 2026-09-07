import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import TopBar from '../components/TopBar';
import { ArrowLeft, Gift, Plus, Check, X } from 'lucide-react';

export default function LoyaltyRules() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newThreshold, setNewThreshold] = useState('');
  const [newWindowDays, setNewWindowDays] = useState('');
  const [newDiscount, setNewDiscount] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editThreshold, setEditThreshold] = useState('');
  const [editWindowDays, setEditWindowDays] = useState('');
  const [editDiscount, setEditDiscount] = useState('');

  function loadRules() {
    api.get('/loyalty-rules')
      .then((res) => setRules(res.data))
      .catch(() => setError('Could not load loyalty rules.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadRules();
  }, []);

  async function addRule() {
    if (!newName.trim() || !newThreshold || !newWindowDays || !newDiscount) {
      setError('Fill in every field.');
      return;
    }
    setError('');
    try {
      await api.post('/loyalty-rules', {
        name: newName,
        threshold: parseInt(newThreshold),
        window_days: parseInt(newWindowDays),
        discount_percent: parseFloat(newDiscount),
      });
      setNewName('');
      setNewThreshold('');
      setNewWindowDays('');
      setNewDiscount('');
      setShowAddForm(false);
      loadRules();
    } catch (err) {
      setError('Could not create rule.');
    }
  }

  function startEdit(rule) {
    setEditingId(rule.id);
    setEditName(rule.name);
    setEditThreshold(String(rule.threshold));
    setEditWindowDays(String(rule.window_days));
    setEditDiscount(String(rule.discount_percent));
  }

  async function saveEdit(id) {
    try {
      await api.patch('/loyalty-rules/' + id, {
        name: editName,
        threshold: parseInt(editThreshold),
        window_days: parseInt(editWindowDays),
        discount_percent: parseFloat(editDiscount),
      });
      setEditingId(null);
      loadRules();
    } catch (err) {
      setError('Could not update rule.');
    }
  }

  async function toggleActive(rule) {
    try {
      await api.patch('/loyalty-rules/' + rule.id, { active: !rule.active });
      loadRules();
    } catch (err) {
      setError('Could not update rule.');
    }
  }

  return (
    <div className="min-h-screen">
      <TopBar title="Loyalty Rules" />
      <div className="max-w-md mx-auto px-4 py-6">

        <Link to="/dashboard" className="flex items-center gap-1.5 text-sm text-gray-600 mb-4">
          <ArrowLeft size={15} /> Back to Dashboard
        </Link>

        {loading && <p className="text-gray-500 text-sm">Loading...</p>}
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        <div className="space-y-2 mb-4">
          {rules.map((rule) => (
            <div key={rule.id} className="bg-white rounded-2xl shadow-sm p-4">
              {editingId === rule.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Rule name"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Washes needed</label>
                      <input
                        type="number"
                        value={editThreshold}
                        onChange={(e) => setEditThreshold(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Within days</label>
                      <input
                        type="number"
                        value={editWindowDays}
                        onChange={(e) => setEditWindowDays(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Discount %</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editDiscount}
                      onChange={(e) => setEditDiscount(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(rule.id)}
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
                <div>
                  <div className="flex items-start gap-3 mb-2">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: 'var(--color-gold-soft)' }}
                    >
                      <Gift size={16} style={{ color: 'var(--color-gold)' }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>
                        {rule.name} {!rule.active && <span className="text-xs font-normal text-gray-400">(inactive)</span>}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Wash {rule.threshold} times in {rule.window_days} days → {parseFloat(rule.discount_percent)}% off next wash
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => startEdit(rule)}
                      className="text-xs font-medium px-3 py-1.5 rounded-full border border-gray-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleActive(rule)}
                      className={
                        'text-xs font-medium px-3 py-1.5 rounded-full ' +
                        (rule.active ? 'bg-gray-100 text-gray-500' : 'text-white')
                      }
                      style={!rule.active ? { backgroundColor: 'var(--color-primary)' } : {}}
                    >
                      {rule.active ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>
            )}
            </div>
          ))}
        </div>

        {rules.length === 0 && !loading && (
          <p className="text-gray-500 text-sm text-center py-4">No loyalty rules yet.</p>
        )}

        {showAddForm ? (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-sm font-medium mb-3">New loyalty rule</p>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Weekly regulars"
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm mb-2 outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Washes needed</label>
                <input
                  type="number"
                  value={newThreshold}
                  onChange={(e) => setNewThreshold(e.target.value)}
                  placeholder="4"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Within days</label>
                <input
                  type="number"
                  value={newWindowDays}
                  onChange={(e) => setNewWindowDays(e.target.value)}
                  placeholder="7"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="text-xs text-gray-500 block mb-1">Discount %</label>
              <input
                type="number"
                step="0.01"
                value={newDiscount}
                onChange={(e) => setNewDiscount(e.target.value)}
                placeholder="20"
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={addRule}
                className="flex-1 py-2.5 rounded-lg text-white text-sm font-medium"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                Create rule
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
            <Plus size={16} /> Add a new rule
          </button>
        )}
      </div>
    </div>
  );
}
