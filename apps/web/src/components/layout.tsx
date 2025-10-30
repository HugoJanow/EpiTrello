import { Outlet, Link } from 'react-router-dom';
import { useAuthStore } from '@/lib/auth-store';
import { Avatar } from './ui/avatar';

export function Layout() {
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/boards" className="flex items-center px-2 text-gray-900 font-bold text-xl">
                EpiTrello
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/profile" className="flex items-center gap-2 text-sm text-gray-700 hover:underline">
                {user ? <Avatar user={user} size="sm" /> : null}
                <span>{user?.displayName}</span>
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary text-sm">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
