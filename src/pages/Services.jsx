import { useState, useEffect } from 'react';
import api from '../api/client';
import { Link } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { ArrowLeft } from 'lucide-react';
import { Sparkles, Plus, Check, X } from 'lucide-react';

export default function Services() {
  const [services, setServices] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');

  function loadServices() {
    api.get('/services/all')
      .then((res) => setServices(res.data))
      .catch(() => setError('Could not load services.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadServices();
  }, []);

  async function addService() {
    if (!newName.trim() || !newPrice) {
      setError('Enter a name and price.');
      return;
    }
    setError('');
    try {
      await api.post('/services', { name: newName, price: parseFloat(newPrice) });
      setNewName('');
      setNewPrice('');
      setShowAddForm(false);
      loadServices();
    } catch (err) {
      setError('Could not add service.');
    }
  }

  function startEdit(service) {
    setEditingId(service.id);
    setEditName(service.name);
    setEditPrice(String(service.price));
  }

  async function saveEdit(id) {
    try {
      await api.patch('/services/' + id, { name: editName, price: parseFloat(editPrice) });
      setEditingId(null);
      loadServices();
    } catch (err) {
      setError('Could not update service.');
    }
  }

  async function toggleActive(service) {
    try {
      await api.patch('/services/' + service.id, { active: !service.active });
      loadServices();
    } catch (err) {
      setError('Could not update service.');
    }
  }

  return (
    <div className="min-h-screen">
      <TopBar title="Services" />
      <div className="max-w-md mx-auto px-4 py-6">

        <Link to="/dashboard" className="flex items-center gap-1.5 text-sm text-gray-600 mb-4">
          <ArrowLeft size={15} /> Back to Dashboard
        </Link>

        {loading && <p className="text-gray-500 text-sm">Loading...</p>}
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        <div className="space-y-2 mb-4">
          {services.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl shadow-sm p-4">
              {editingId === s.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(s.id)}
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
                    <Sparkles size={16} style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>
                      {s.name} {!s.active && <span className="text-xs font-normal text-gray-400">(inactive)</span>}
                    </p>
                    <p className="text-sm text-gray-500">R{parseFloat(s.price).toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => startEdit(s)}
                    className="text-xs font-medium px-3 py-1.5 rounded-full border border-gray-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleActive(s)}
                    className={
                      'text-xs font-medium px-3 py-1.5 rounded-full ' +
                      (s.active ? 'bg-gray-100 text-gray-500' : 'text-white')
                    }
                    style={!s.active ? { backgroundColor: 'var(--color-primary)' } : {}}
                  >
                    {s.active ? 'Disable' : 'Enable'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {showAddForm ? (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-sm font-medium mb-3">New service</p>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Interior detail"
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm mb-2 outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
            <input
              type="number"
              step="0.01"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              placeholder="Price (e.g. 120.00)"
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm mb-3 outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
            <div className="flex gap-2">
              <button
                onClick={addService}
                className="flex-1 py-2.5 rounded-lg text-white text-sm font-medium"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                Add service
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
            <Plus size={16} /> Add a new service
          </button>
        )}
      </div>
    </div>
  );
}
