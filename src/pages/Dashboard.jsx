import { useState, useEffect } from 'react';
import api from '../api/client';
import TopBar from '../components/TopBar';

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
      <div className="max-w-2xl mx-auto px-4 py-6">

        <div className="grid grid-cols-2 gap-4 mb-6">
          <StatCard label="Washes today" value={summary.washes_today} />
          <StatCard label="Revenue today" value={`R${summary.revenue_today}`} />
          <StatCard label="Washes this week" value={summary.washes_this_week} />
          <StatCard label="Revenue this week" value={`R${summary.revenue_this_week}`} />
        </div>

        <div className="p-4 rounded-lg bg-white border border-gray-200 mb-6">
          <p className="font-medium mb-3">Repeat customers</p>
          <p className="text-2xl font-semibold text-[var(--color-teal)]">
            {summary.repeat_customers} <span className="text-sm text-gray-400 font-normal">of {summary.total_customers} total</span>
          </p>
        </div>

        <div className="p-4 rounded-lg bg-white border border-gray-200">
          <p className="font-medium mb-3">Washes by employee (this week)</p>
          <div className="space-y-2">
            {summary.employees_this_week.map((emp) => (
              <div key={emp.id} className="flex justify-between text-sm">
                <span>{emp.name}</span>
                <span className="font-medium">{emp.washes_this_week}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="p-4 rounded-lg bg-white border border-gray-200">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-semibold text-[var(--color-ink)]">{value}</p>
    </div>
  );
}
