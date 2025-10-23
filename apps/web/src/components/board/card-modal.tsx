import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cardsApi } from '@/lib/api';
import { Calendar, Tag, User, AlignLeft, Trash2 } from 'lucide-react';
import { Avatar } from '../ui/avatar';
import { cn } from '@/lib/utils';

interface CardMemberUser {
  id: string;
  email?: string;
  displayName: string;
  avatarUrl?: string | null;
}

interface CardMember {
  id: string;
  user: CardMemberUser;
}

interface CardLabel {
  id: string;
  name: string;
  color: string;
}

interface Card {
  id: string;
  title: string;
  description?: string | null;
  listId: string;
  priority?: string | null;
  labels?: CardLabel[];
  members?: CardMember[];
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { comments?: number; attachments?: number };
}

interface CardModalProps {
  card: Card;
  open: boolean;
  onClose: () => void;
}

export function CardModal({ card, open, onClose }: CardModalProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [newMemberId, setNewMemberId] = useState<string>('');
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#10b981');
  const [dueDateValue, setDueDateValue] = useState<string | null>(card.dueDate ? new Date(card.dueDate).toISOString().slice(0, 10) : null);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Card>) => cardsApi.updateCard(card.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', card.listId] });
      setIsEditingTitle(false);
      setIsEditingDescription(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => cardsApi.deleteCard(card.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', card.listId] });
      onClose();
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: (userId: string) => cardsApi.addMember(card.id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', card.listId] });
      setNewMemberId('');
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => cardsApi.removeMember(card.id, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cards', card.listId] }),
  });

  const addLabelMutation = useMutation({
    mutationFn: (data: { name: string; color: string }) => cardsApi.addLabel(card.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', card.listId] });
      setNewLabelName('');
    },
  });

  const removeLabelMutation = useMutation({
    mutationFn: (labelId: string) => cardsApi.removeLabel(card.id, labelId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cards', card.listId] }),
  });

  const handleUpdateTitle = () => {
    if (title.trim() && title !== card.title) {
      updateMutation.mutate({ title: title.trim() });
    } else {
      setTitle(card.title);
      setIsEditingTitle(false);
    }
  };

  const handleUpdateDescription = () => {
    if (description !== card.description) {
      updateMutation.mutate({ description: description || null });
    } else {
      setIsEditingDescription(false);
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this card?')) {
      deleteMutation.mutate();
    }
  };

  const priorityConfig = {
    LOW: { color: 'bg-green-500', text: 'Low', class: 'text-green-700 bg-green-50 border-green-200' },
    MEDIUM: { color: 'bg-yellow-500', text: 'Medium', class: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
    HIGH: { color: 'bg-red-500', text: 'High', class: 'text-red-700 bg-red-50 border-red-200' },
  };

  const priority = card.priority ? priorityConfig[card.priority as keyof typeof priorityConfig] : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          {isEditingTitle ? (
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateTitle(); }} className="flex gap-2">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleUpdateTitle}
                className="text-xl font-semibold"
                autoFocus
              />
            </form>
          ) : (
            <DialogTitle 
              onClick={() => setIsEditingTitle(true)}
              className="cursor-pointer hover:text-primary-600 transition-colors"
            >
              {card.title}
            </DialogTitle>
          )}
        </DialogHeader>

        <div className="grid grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="col-span-3 space-y-6">
            {/* Priority */}
            {priority && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4 text-gray-600" />
                  <h3 className="text-sm font-semibold text-gray-700">Priority</h3>
                </div>
                <span className={cn('px-3 py-1.5 text-sm font-medium rounded-lg border inline-block', priority.class)}>
                  {priority.text}
                </span>
              </div>
            )}

            {/* Description */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlignLeft className="w-4 h-4 text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-700">Description</h3>
              </div>
              {isEditingDescription ? (
                <div className="space-y-2">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a more detailed description..."
                    className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none min-h-[120px]"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleUpdateDescription}>
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => {
                      setDescription(card.description || '');
                      setIsEditingDescription(false);
                    }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingDescription(true)}
                  className="min-h-[80px] p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer border border-gray-200 text-sm text-gray-700 transition-colors"
                >
                  {card.description || 'Add a more detailed description...'}
                </div>
              )}
            </div>

            {/* Labels */}
            {card.labels && card.labels.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4 text-gray-600" />
                  <h3 className="text-sm font-semibold text-gray-700">Labels</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {card.labels?.map((label: CardLabel) => (
                    <span
                      key={label.id}
                      className="px-3 py-1 text-sm font-medium rounded-lg text-white"
                      style={{ backgroundColor: label.color }}
                    >
                      {label.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Members */}
            {card.members && card.members.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-gray-600" />
                  <h3 className="text-sm font-semibold text-gray-700">Members</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {card.members?.map((member: CardMember) => (
                    <div key={member.id} className="flex items-center gap-2">
                      <Avatar user={member.user} size="sm" />
                      <span className="text-sm text-gray-700">{member.user.displayName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Due Date */}
            {card.dueDate && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <h3 className="text-sm font-semibold text-gray-700">Due Date</h3>
                </div>
                <p className="text-sm text-gray-700">
                  {new Date(card.dueDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Actions</h3>
            <Button
              variant="secondary"
              size="sm"
              className="w-full justify-start rounded-full py-2 px-3 bg-gray-100 hover:bg-gray-200"
              onClick={() => setSelectedAction(selectedAction === 'members' ? null : 'members')}
            >
              <User className="w-4 h-4 mr-3 text-gray-700" />
              Members
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="w-full justify-start rounded-full py-2 px-3 bg-gray-100 hover:bg-gray-200"
              onClick={() => setSelectedAction(selectedAction === 'labels' ? null : 'labels')}
            >
              <Tag className="w-4 h-4 mr-3 text-gray-700" />
              Labels
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="w-full justify-start rounded-full py-2 px-3 bg-gray-100 hover:bg-gray-200"
              onClick={() => setSelectedAction(selectedAction === 'duedate' ? null : 'duedate')}
            >
              <Calendar className="w-4 h-4 mr-3 text-gray-700" />
              Due Date
            </Button>

            {/* Action panels: Members / Labels / Due Date */}
            {selectedAction === 'members' && (
              <div className="mt-3 p-3 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-700">
                <div className="font-medium mb-2">Members</div>
                <div className="space-y-2">
                  {card.members && card.members.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {card.members.map((m: CardMember) => (
                        <div key={m.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar user={m.user} size="sm" />
                            <div className="text-sm text-gray-700">{m.user.displayName}</div>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => removeMemberMutation.mutate(m.user.id)}>
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No members</div>
                  )}

                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newMemberId}
                      onChange={(e) => setNewMemberId(e.target.value)}
                      placeholder="User ID to add"
                      className="flex-1"
                    />
                    <Button size="sm" onClick={() => addMemberMutation.mutate(newMemberId)} disabled={!newMemberId}>
                      Add
                    </Button>
                  </div>
                </div>
                <div className="mt-3">
                  <Button size="sm" variant="ghost" onClick={() => setSelectedAction(null)}>Close</Button>
                </div>
              </div>
            )}

            {selectedAction === 'labels' && (
              <div className="mt-3 p-3 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-700">
                <div className="font-medium mb-2">Labels</div>
                <div className="flex flex-col gap-2">
                  {card.labels && card.labels.length > 0 ? (
                    card.labels.map((label: CardLabel) => (
                      <div key={label.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded" style={{ backgroundColor: label.color }} />
                          <div className="text-sm text-gray-700">{label.name}</div>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => removeLabelMutation.mutate(label.id)}>
                          Remove
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">No labels</div>
                  )}

                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newLabelName}
                      onChange={(e) => setNewLabelName(e.target.value)}
                      placeholder="Label name"
                      className="flex-1"
                    />
                    <input type="color" value={newLabelColor} onChange={(e) => setNewLabelColor(e.target.value)} className="w-10 h-8 rounded" />
                    <Button size="sm" onClick={() => addLabelMutation.mutate({ name: newLabelName, color: newLabelColor })} disabled={!newLabelName}>
                      Add
                    </Button>
                  </div>
                </div>
                <div className="mt-3">
                  <Button size="sm" variant="ghost" onClick={() => setSelectedAction(null)}>Close</Button>
                </div>
              </div>
            )}

            {selectedAction === 'duedate' && (
              <div className="mt-3 p-3 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-700">
                <div className="font-medium mb-2">Due Date</div>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={dueDateValue ?? ''}
                    onChange={(e) => setDueDateValue(e.target.value || null)}
                    className="rounded border border-gray-300 px-2 py-1"
                  />
                  <Button size="sm" onClick={() => updateMutation.mutate({ dueDate: dueDateValue ? new Date(dueDateValue).toISOString() : null })}>
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { setDueDateValue(null); updateMutation.mutate({ dueDate: null }); }}>
                    Clear
                  </Button>
                </div>
                <div className="mt-3">
                  <Button size="sm" variant="ghost" onClick={() => setSelectedAction(null)}>Close</Button>
                </div>
              </div>
            )}
            <div className="pt-2 border-t border-gray-200">
              <Button 
                variant="danger" 
                size="sm" 
                className="w-full justify-start"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500 space-y-1">
          <p>Created: {new Date(card.createdAt).toLocaleString()}</p>
          <p>Last updated: {new Date(card.updatedAt).toLocaleString()}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
