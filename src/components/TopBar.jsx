import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

export default function TopBar({ title, showBadge = true }) {
  const { employee, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-md mx-auto px-4 py-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <img src="/logo.png" alt="Kasi Wash" className="h-10 w-auto object-contain shrink-0" />
          <div className="w-px h-8 bg-gray-200 shrink-0" />
          <div className="min-w-0">
            <h1 className="text-lg font-bold leading-tight truncate" style={{ color: 'var(--color-ink)' }}>
              {title}
            </h1>
            {showBadge && (
              <span
                className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-primary-dark)' }}
              >
                {employee?.name} · {employee?.role}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm px-3.5 py-2 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition shrink-0"
        >
          <LogOut size={14} />
          Log out
        </button>
      </div>
    </div>
  );
}
