import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cardsApi } from '@/lib/api';
import { Calendar, Tag, User, AlignLeft, Trash2 } from 'lucide-react';
import { Avatar } from '../ui/avatar';
import { cn } from '@/lib/utils';

interface CardModalProps {
  card: any;
  open: boolean;
  onClose: () => void;
}

export function CardModal({ card, open, onClose }: CardModalProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data: any) => cardsApi.updateCard(card.id, data),
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
                  {card.labels.map((label: any) => (
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
                  {card.members.map((member: any) => (
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
            <Button variant="secondary" size="sm" className="w-full justify-start">
              <User className="w-4 h-4 mr-2" />
              Members
            </Button>
            <Button variant="secondary" size="sm" className="w-full justify-start">
              <Tag className="w-4 h-4 mr-2" />
              Labels
            </Button>
            <Button variant="secondary" size="sm" className="w-full justify-start">
              <Calendar className="w-4 h-4 mr-2" />
              Due Date
            </Button>
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
