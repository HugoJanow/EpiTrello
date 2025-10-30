import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/lib/auth-store';
import { usersApi } from '@/lib/api';

export function ProfilePage() {
  const queryClient = useQueryClient();
  const { user: storedUser } = useAuthStore();

  const { data } = useQuery({
    queryKey: ['me'],
    queryFn: async () => (await usersApi.getMe()).user,
    enabled: !!storedUser,
  });

  const [displayName, setDisplayName] = useState<string | undefined>(storedUser?.displayName);
  const [avatarUrl, setAvatarUrl] = useState<string | null | undefined>(storedUser?.avatarUrl ?? undefined);

  const updateMutation = useMutation({
    mutationFn: (payload: { displayName?: string; avatarUrl?: string | null }) => usersApi.updateMe(payload),
    onSuccess: (res) => {
      // Update auth store user and invalidate cache
      const updated = res.user;
      // Directly set the user in auth store
       
      // @ts-ignore
      useAuthStore.setState({ user: updated });
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });

  if (!storedUser) {
    return (
      <div className="p-6">
        <p className="text-gray-600">No user logged in.</p>
      </div>
    );
  }

  const user = data ?? storedUser;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Profile</h1>

      <div className="bg-white border rounded-lg p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Display name</label>
          <input
            value={displayName ?? ''}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 block w-full border rounded px-3 py-2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Avatar URL</label>
          <input
            value={avatarUrl ?? ''}
            onChange={(e) => setAvatarUrl(e.target.value || null)}
            className="mt-1 block w-full border rounded px-3 py-2"
          />
          {avatarUrl ? (
            <img src={avatarUrl} alt="avatar" className="w-24 h-24 rounded mt-3 object-cover" />
          ) : (
            <div className="w-24 h-24 rounded bg-gray-100 mt-3 flex items-center justify-center text-sm text-gray-500">No avatar</div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            className="bg-primary-600 text-white px-4 py-2 rounded"
            onClick={() => updateMutation.mutate({ displayName, avatarUrl })}
            disabled={updateMutation.status === 'pending'}
          >
            {updateMutation.status === 'pending' ? 'Saving...' : 'Save'}
          </button>
          <Link to="/boards" className="text-primary-600 hover:underline">Back to boards</Link>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <div><strong>User ID:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{user.id}</code></div>
          <div className="mt-2">Email: {user.email}</div>
        </div>
      </div>
    </div>
  );
}
