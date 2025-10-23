import { useAuthStore } from '@/lib/auth-store';
import { Link } from 'react-router-dom';

export function ProfilePage() {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="p-6">
        <p className="text-gray-600">No user logged in.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Profile</h1>
      <div className="bg-white border rounded-lg p-4">
        <div className="mb-2"><span className="font-medium">Display name: </span>{user.displayName}</div>
        <div className="mb-2"><span className="font-medium">User ID: </span><code className="text-sm bg-gray-100 px-2 py-1 rounded">{user.id}</code></div>
        <div className="mt-4">
          <Link to="/boards" className="text-primary-600 hover:underline">Back to boards</Link>
        </div>
      </div>
    </div>
  );
}
