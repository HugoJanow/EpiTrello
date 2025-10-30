import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { boardsApi } from '@/lib/api';

interface InviteModalProps {
  boardId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteModal({ boardId, open, onOpenChange }: InviteModalProps) {
  const [identifier, setIdentifier] = useState('');
  const [role, setRole] = useState<'member' | 'viewer' | 'owner'>('member');

  const mutation = useMutation({
    mutationFn: (payload: { identifier: string; role?: 'member' | 'viewer' | 'owner' }) => boardsApi.inviteBoard(boardId, payload),
    onSuccess: () => {
      alert('Invitation sent');
      setIdentifier('');
      onOpenChange(false);
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      alert('Failed to invite: ' + message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invite to board</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email or username</label>
            <Input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="user@example.com or username" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value as 'member' | 'viewer' | 'owner')} className="mt-1 block w-full border rounded px-3 py-2">
              <option value="member">Member</option>
              <option value="viewer">Viewer</option>
              <option value="owner">Owner</option>
            </select>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={() => mutation.mutate({ identifier, role })} disabled={!identifier || mutation.isPending}>{mutation.isPending ? 'Sending...' : 'Invite'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
