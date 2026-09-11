import { useState, useEffect } from 'react';
import api from '../api/client';
import TopBar from '../components/TopBar';
import { Car, Clock, Droplets, CheckCircle2 } from 'lucide-react';

export default function ActiveWashes() {
  const [washes, setWashes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  function loadWashes() {
    api.get('/washes/active')
      .then((res) => setWashes(res.data))
      .catch(() => setError('Could not load active washes.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadWashes();
    const interval = setInterval(loadWashes, 15000);
    return () => clearInterval(interval);
  }, []);

  async function advanceStatus(wash) {
    const next = wash.status === 'pending' ? 'washing' : 'done';
    setUpdatingId(wash.id);
    try {
      await api.patch('/washes/' + wash.id + '/status', { status: next });
      loadWashes();
    } catch (err) {
      setError('Could not update status.');
    } finally {
      setUpdatingId(null);
    }
  }

  function formatTime(iso) {
    return new Date(iso).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
  }

  const statusConfig = {
    pending: { label: 'Pending', color: '#6B7280', bg: '#F3F4F6', icon: Clock },
    washing: { label: 'Washing', color: 'var(--color-primary)', bg: 'var(--color-surface)', icon: Droplets },
  };

  return (
    <div className="min-h-screen">
      <TopBar title="Active Washes" showBadge={false} />
      <div className="max-w-md mx-auto px-4 py-6">

        {loading && <p className="text-gray-500 text-sm">Loading...</p>}
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        <div className="space-y-2">
          {washes.map((w) => {
            const cfg = statusConfig[w.status] || statusConfig.pending;
            const Icon = cfg.icon;
            return (
              <div key={w.id} className="bg-white rounded-2xl shadow-sm p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: cfg.bg }}
                    >
                      <Icon size={16} style={{ color: cfg.color }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-ink)' }}>
                        {w.customer_name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {w.vehicle_make} {w.vehicle_model} {w.vehicle_plate ? '· ' + w.vehicle_plate : ''}
                      </p>
                    </div>
                  </div>
                  <span
                    className="text-xs font-medium px-2.5 py-1 rounded-full shrink-0"
                    style={{ backgroundColor: cfg.bg, color: cfg.color }}
                  >
                    {cfg.label}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    {w.service_name} · checked in {formatTime(w.created_at)}
                  </p>
                  <button
                    onClick={() => advanceStatus(w)}
                    disabled={updatingId === w.id}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full text-white disabled:opacity-50"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    {w.status === 'pending' ? (
                      <>Start washing</>
                    ) : (
                      <><CheckCircle2 size={13} /> Mark done</>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {!loading && washes.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-8">No cars in progress right now.</p>
        )}
      </div>
    </div>
  );
}
