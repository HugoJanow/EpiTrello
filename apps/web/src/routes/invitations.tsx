import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invitationsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { Link } from 'react-router-dom';

type Invitation = {
  id: string;
  boardId: string;
  role: 'owner' | 'member' | 'viewer' | string;
  status: string;
  inviterId: string;
};

export function InvitationsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['invitations'],
    queryFn: async () => (await invitationsApi.getMyInvitations()).invitations,
    enabled: !!user,
  });

  const acceptMutation = useMutation({
    mutationFn: (id: string) => invitationsApi.acceptInvitation(id),
    onSuccess: () => {
      // refresh invitations list and boards list so the UI updates immediately
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });

  const declineMutation = useMutation({
    mutationFn: (id: string) => invitationsApi.declineInvitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });

  if (!user) return <div className="p-6">Please login to view invitations.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Invitations</h1>
      <div className="mb-4"><Link to="/boards" className="text-primary-600 hover:underline">Back to boards</Link></div>

      <div className="bg-white border rounded-lg p-6">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-4">
            {(data ?? []).length === 0 ? (
              <p className="text-gray-600">No pending invitations.</p>
            ) : (
              ((data ?? []) as Invitation[]).map((inv: Invitation) => (
                <div key={inv.id} className="flex items-center justify-between border rounded p-3">
                  <div>
                    <div className="font-medium">Board: <code className="bg-gray-100 px-2 py-1 rounded">{inv.boardId}</code></div>
                    <div className="text-sm text-gray-600">Role: {inv.role} • Status: {inv.status}</div>
                    <div className="text-sm text-gray-500">Invited by: {inv.inviterId}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="bg-primary-600 text-white px-3 py-1 rounded" onClick={() => acceptMutation.mutate(inv.id)} disabled={acceptMutation.status === 'pending'}>Accept</button>
                    <button className="text-red-600 px-3 py-1 rounded" onClick={() => declineMutation.mutate(inv.id)} disabled={declineMutation.status === 'pending'}>Decline</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
