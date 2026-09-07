import { useState, useEffect } from 'react';
import api from '../api/client';
import { Link } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { ArrowLeft } from 'lucide-react';
import { Car, Search, Sparkles, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function History() {
  const [washes, setWashes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [showFilters, setShowFilters] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [services, setServices] = useState([]);
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 15;

  useEffect(() => {
    api.get('/employees/active').then((res) => setEmployees(res.data)).catch(() => {});
    api.get('/services').then((res) => setServices(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    loadWashes();
  }, [page, employeeFilter, serviceFilter, dateFrom, dateTo]);

  function loadWashes() {
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    params.set('page', page);
    params.set('page_size', pageSize);
    if (employeeFilter) params.set('employee_id', employeeFilter);
    if (serviceFilter) params.set('service_id', serviceFilter);
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);

    api.get('/washes?' + params.toString())
      .then((res) => {
        setWashes(res.data.washes);
        setTotalPages(res.data.total_pages);
        setTotal(res.data.total);
      })
      .catch(() => setError('Could not load transaction history.'))
      .finally(() => setLoading(false));
  }

  function clearFilters() {
    setEmployeeFilter('');
    setServiceFilter('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  }

  const activeFilterCount = [employeeFilter, serviceFilter, dateFrom, dateTo].filter(Boolean).length;

  const filtered = washes.filter((w) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      w.customer_name.toLowerCase().includes(q) ||
      w.customer_phone.toLowerCase().includes(q) ||
      (w.vehicle_plate || '').toLowerCase().includes(q) ||
      w.employee_name.toLowerCase().includes(q)
    );
  });

  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' }) +
      ' · ' + d.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="min-h-screen">
      <TopBar title="History" />
      <div className="max-w-md mx-auto px-4 py-6">

        <Link to="/dashboard" className="flex items-center gap-1.5 text-sm text-gray-600 mb-4">
          <ArrowLeft size={15} /> Back to Dashboard
        </Link>

        <div className="flex gap-2 mb-3">
          <div className="flex-1 flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer, phone, plate, attendant"
              className="w-full py-2.5 bg-transparent outline-none text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={
              'flex items-center gap-1.5 px-3.5 rounded-xl border text-sm font-medium shrink-0 ' +
              (activeFilterCount > 0 ? 'text-white border-transparent' : 'bg-white border-gray-200 text-gray-600')
            }
            style={activeFilterCount > 0 ? { backgroundColor: 'var(--color-primary)' } : {}}
          >
            <SlidersHorizontal size={15} />
            {activeFilterCount > 0 && activeFilterCount}
          </button>
        </div>

        {showFilters && (
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>Filters</p>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-gray-500">
                  <X size={12} /> Clear all
                </button>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Attendant</label>
              <select
                value={employeeFilter}
                onChange={(e) => { setEmployeeFilter(e.target.value); setPage(1); }}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                <option value="">All attendants</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Service</label>
              <select
                value={serviceFilter}
                onChange={(e) => { setServiceFilter(e.target.value); setPage(1); }}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                <option value="">All services</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                  className="w-full rounded-lg border border-gray-200 px-2.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                  className="w-full rounded-lg border border-gray-200 px-2.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
            </div>
          </div>
        )}

        {!loading && (
          <p className="text-xs text-gray-500 mb-3">{total} wash{total === 1 ? '' : 'es'} found</p>
        )}

        {loading && <p className="text-gray-500 text-sm">Loading...</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="space-y-2 mb-4">
          {filtered.map((w) => (
            <div key={w.id} className="bg-white rounded-2xl shadow-sm p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'var(--color-surface)' }}
                  >
                    <Car size={14} style={{ color: 'var(--color-primary)' }} />
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
                <p className="text-xs text-gray-400 shrink-0 whitespace-nowrap">{formatDate(w.created_at)}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Sparkles size={12} />
                  {w.service_name} · washed by {w.employee_name}
                </div>
                <div className="text-right shrink-0">
                  {w.discount_percent > 0 && (
                    <p className="text-xs" style={{ color: 'var(--color-gold)' }}>-{w.discount_percent}% loyalty</p>
                  )}
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>
                    R{parseFloat(w.price_charged).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!loading && filtered.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-8">No washes found.</p>
        )}

        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 text-sm px-3 py-2 rounded-lg border border-gray-200 disabled:opacity-40"
            >
              <ChevronLeft size={15} /> Prev
            </button>
            <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 text-sm px-3 py-2 rounded-lg border border-gray-200 disabled:opacity-40"
            >
              Next <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
