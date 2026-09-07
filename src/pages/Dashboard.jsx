import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import TopBar from '../components/TopBar';
import { Users, Sparkles, Clock, UserRound, Gift, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/reports/summary')
      .then((res) => setSummary(res.data))
      .catch(() => setError('Could not load the dashboard.'));
  }, []);

  if (error) {
    return (
      <div className="min-h-screen">
        <TopBar title="Dashboard" />
        <p className="text-red-600 p-6">{error}</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen">
        <TopBar title="Dashboard" />
        <p className="p-6 text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <TopBar title="Dashboard" />
      <div className="max-w-md mx-auto px-4 py-6">

        <NavCard to="/employees" icon={<Users size={18} />} title="Team performance" subtitle="Washes and revenue per attendant" />
        <NavCard to="/services" icon={<Sparkles size={18} />} title="Services & pricing" subtitle="Add or edit what you offer" />
        <NavCard to="/history" icon={<Clock size={18} />} title="Transaction history" subtitle="Every wash, who did it, and when" />
        <NavCard to="/customers" icon={<UserRound size={18} />} title="Customers" subtitle="Browse and search your customer base" />
        <NavCard to="/loyalty-rules" icon={<Gift size={18} />} title="Loyalty rules" subtitle="Set up discounts for repeat customers" />

        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatCard label="Washes today" value={summary.washes_today} />
          <StatCard label="Revenue today" value={'R' + summary.revenue_today} />
          <StatCard label="Washes this week" value={summary.washes_this_week} />
          <StatCard label="Revenue this week" value={'R' + summary.revenue_this_week} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <p className="font-medium mb-3">Repeat customers</p>
          <p className="text-2xl font-semibold" style={{ color: 'var(--color-primary)' }}>
            {summary.repeat_customers} <span className="text-sm text-gray-400 font-normal">of {summary.total_customers} total</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function NavCard({ to, icon, title, subtitle }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between bg-white rounded-2xl shadow-sm p-4 mb-3"
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-surface)' }}
        >
          <span style={{ color: 'var(--color-primary)' }}>{icon}</span>
        </div>
        <div>
          <p className="font-semibold text-[15px]" style={{ color: 'var(--color-ink)' }}>{title}</p>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>
      <ArrowRight size={18} className="text-gray-400" />
    </Link>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-semibold" style={{ color: 'var(--color-ink)' }}>{value}</p>
    </div>
  );
}
