import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import TopBar from '../components/TopBar';
import { ArrowLeft } from 'lucide-react';
import { Search, UserRound, Car, Star } from 'lucide-react';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  function loadCustomers() {
    setLoading(true);
    const params = search ? '?search=' + encodeURIComponent(search) : '';
    api.get('/customers' + params)
      .then((res) => setCustomers(res.data))
      .catch(() => setError('Could not load customers.'))
      .finally(() => setLoading(false));
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    loadCustomers();
  }

  return (
    <div className="min-h-screen">
      <TopBar title="Customers" />
      <div className="max-w-md mx-auto px-4 pt-4 pb-10">

        <Link to="/dashboard" className="flex items-center gap-1.5 text-sm text-gray-600 mb-4">
          <ArrowLeft size={15} /> Back to Dashboard
        </Link>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 mb-4">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or phone"
            className="w-full py-2.5 bg-transparent outline-none text-sm"
          />
        </form>

        {loading && <p className="text-gray-500 text-sm">Loading...</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="space-y-2">
          {customers.map((c) => (
            <Link key={c.id} to={'/customers/' + c.id} className="block bg-white rounded-2xl shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'var(--color-surface)' }}
                >
                  <UserRound size={18} style={{ color: 'var(--color-primary)' }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-ink)' }}>
                    {c.name}
                  </p>
                  <p className="text-xs text-gray-500">{c.phone}</p>
                </div>
                {c.total_visits >= 4 && (
                  <div className="flex items-center gap-1 shrink-0" style={{ color: 'var(--color-gold)' }}>
                    <Star size={13} fill="currentColor" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Car size={13} />
                  {c.vehicle_count} vehicle{c.vehicle_count === 1 ? '' : 's'}
                </div>
                <div className="text-xs text-gray-500">
                  {c.total_visits} visit{c.total_visits === 1 ? '' : 's'}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {!loading && customers.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-8">No customers found.</p>
        )}
      </div>
    </div>
  );
}
