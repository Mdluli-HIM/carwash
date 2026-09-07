import { useState, useEffect } from 'react';
import api from '../api/client';
import { Link } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { ArrowLeft } from 'lucide-react';
import { UserRound, Sparkles, Wallet, TrendingUp } from 'lucide-react';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/employees/performance')
      .then((res) => setEmployees(res.data))
      .catch(() => setError('Could not load employee performance.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <TopBar title="Team" />
      <div className="max-w-md mx-auto px-4 py-6">

        <Link to="/dashboard" className="flex items-center gap-1.5 text-sm text-gray-600 mb-4">
          <ArrowLeft size={15} /> Back to Dashboard
        </Link>

        {loading && <p className="text-gray-500 text-sm">Loading...</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="space-y-3">
          {employees.map((emp) => (
            <EmployeeCard key={emp.id} employee={emp} />
          ))}
        </div>

        {!loading && employees.length === 0 && !error && (
          <p className="text-gray-500 text-sm">No employees found.</p>
        )}
      </div>
    </div>
  );
}

function EmployeeCard({ employee }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: 'var(--color-surface)' }}
        >
          <UserRound size={20} style={{ color: 'var(--color-primary)' }} />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-[15px] truncate" style={{ color: 'var(--color-ink)' }}>
            {employee.name}
          </p>
          <p className="text-xs text-gray-500 capitalize">{employee.role}</p>
        </div>
        {!employee.active && (
          <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 shrink-0">
            Inactive
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Stat
          icon={<Sparkles size={14} />}
          label="Total washes"
          value={employee.total_washes}
        />
        <Stat
          icon={<Wallet size={14} />}
          label="Total revenue"
          value={'R' + employee.total_revenue.toFixed(2)}
        />
        <Stat
          icon={<TrendingUp size={14} />}
          label="This week"
          value={employee.washes_this_week + ' washes'}
        />
        <Stat
          icon={<Wallet size={14} />}
          label="Revenue this week"
          value={'R' + employee.revenue_this_week.toFixed(2)}
        />
      </div>
    </div>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="flex items-center gap-1.5 text-gray-500 mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>{value}</p>
    </div>
  );
}
