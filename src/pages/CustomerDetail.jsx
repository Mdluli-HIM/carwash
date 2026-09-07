import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import TopBar from '../components/TopBar';
import { ArrowLeft, Car, Sparkles, Wallet, Star, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CustomerDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    api.get('/customers/' + id + '?page=' + page + '&page_size=5')
      .then((res) => setData(res.data))
      .catch(() => setError('Could not load this customer.'))
      .finally(() => setLoading(false));
  }, [id, page]);

  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) +
      ' · ' + d.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="min-h-screen">
      <TopBar title="Customer" />
      <div className="max-w-md mx-auto px-4 pt-4 pb-10">

        <Link to="/customers" className="flex items-center gap-1.5 text-sm text-gray-600 mb-4">
          <ArrowLeft size={15} /> Back to customers
        </Link>

        {loading && <p className="text-gray-500 text-sm">Loading...</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}

        {data && (
          <>
            <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'var(--color-surface)' }}
                >
                  <span className="text-lg font-semibold" style={{ color: 'var(--color-primary)' }}>
                    {data.customer.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-[15px]" style={{ color: 'var(--color-ink)' }}>
                      {data.customer.name}
                    </p>
                    {data.customer.total_visits >= 4 && (
                      <Star size={14} style={{ color: 'var(--color-gold)' }} fill="currentColor" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{data.customer.phone}</p>
                  {data.customer.email && (
                    <p className="text-xs text-gray-500">{data.customer.email}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <MiniStat icon={<Car size={13} />} label="Vehicles" value={data.vehicles.length} />
                <MiniStat icon={<Sparkles size={13} />} label="Visits" value={data.customer.total_visits} />
                <MiniStat icon={<Wallet size={13} />} label="Total spent" value={'R' + data.total_spent.toFixed(0)} />
              </div>
            </div>

            {data.vehicles.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
                <p className="text-sm font-semibold mb-3" style={{ color: 'var(--color-ink)' }}>Vehicles</p>
                <div className="space-y-2">
                  {data.vehicles.map((v) => (
                    <div key={v.id} className="flex items-center gap-2 text-sm text-gray-600">
                      <Car size={14} className="text-gray-400" />
                      {v.make} {v.model} {v.plate ? '· ' + v.plate : ''}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>Wash history</p>
              <p className="text-xs text-gray-500">{data.total_washes} total</p>
            </div>

            <div className="space-y-2 mb-4">
              {data.washes.map((w) => (
                <div key={w.id} className="bg-white rounded-2xl shadow-sm p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-xs text-gray-500">{formatDate(w.created_at)}</p>
                    <div className="text-right">
                      {w.discount_percent > 0 && (
                        <p className="text-xs" style={{ color: 'var(--color-gold)' }}>-{w.discount_percent}% loyalty</p>
                      )}
                      <p className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>
                        R{parseFloat(w.price_charged).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {w.vehicle_make} {w.vehicle_model} {w.vehicle_plate ? '· ' + w.vehicle_plate : ''}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {w.service_name} · washed by {w.employee_name}
                  </p>
                </div>
              ))}
            </div>

            {data.washes.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-8">No washes yet.</p>
            )}

            {data.total_pages > 1 && (
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white disabled:opacity-40"
                >
                  <ChevronLeft size={15} /> Prev
                </button>
                <p className="text-xs text-gray-500">Page {page} of {data.total_pages}</p>
                <button
                  onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
                  disabled={page === data.total_pages}
                  className="flex items-center gap-1 text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white disabled:opacity-40"
                >
                  Next <ChevronRight size={15} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function MiniStat({ icon, label, value }) {
  return (
    <div className="rounded-xl p-2.5 text-center" style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
        {icon}
      </div>
      <p className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>{value}</p>
      <p className="text-[10px] text-gray-500">{label}</p>
    </div>
  );
}
