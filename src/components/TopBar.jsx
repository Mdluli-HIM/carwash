import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function TopBar({ title }) {
  const { employee, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-[var(--color-ink)] text-white">
      <div>
        <h1 className="text-lg font-semibold">{title}</h1>
        <p className="text-xs text-gray-300">{employee?.name} · {employee?.role}</p>
      </div>
      <button
        onClick={handleLogout}
        className="text-sm px-3 py-1.5 rounded-lg border border-gray-500 hover:bg-white/10 transition"
      >
        Log out
      </button>
    </div>
  );
}
