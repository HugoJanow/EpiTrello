import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { Avatar } from '../ui/avatar';
import { Calendar, MessageSquare, Paperclip, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CardModal } from './card-modal';

interface Label {
  id: string;
  name: string;
  color: string;
}

interface UserRef {
  id: string;
  displayName: string;
  avatarUrl?: string | null;
}

interface MemberRef {
  id: string;
  user: UserRef;
}

interface CardCount {
  comments?: number;
  attachments?: number;
}

export interface Card {
  id: string;
  listId: string;
  title: string;
  description?: string | null;
  labels?: Label[];
  priority?: string | null;
  dueDate?: string | null;
  _count?: CardCount;
  members?: MemberRef[];
  createdAt: string;
  updatedAt: string;
}

interface CardProps {
  card: Card;
  isDragging?: boolean;
}

export function Card({ card, isDragging }: CardProps) {
  const [showModal, setShowModal] = useState(false);
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    setActivatorNodeRef,
    transform, 
    transition, 
    isDragging: isSortableDragging 
  } = useSortable({
    id: card.id,
    data: { card, listId: card.listId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityConfig = {
    LOW: { color: 'bg-green-500', text: 'Low', class: 'text-green-700 bg-green-50 border-green-200' },
    MEDIUM: { color: 'bg-yellow-500', text: 'Medium', class: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
    HIGH: { color: 'bg-red-500', text: 'High', class: 'text-red-700 bg-red-50 border-red-200' },
  };

  const priority = card.priority ? priorityConfig[card.priority as keyof typeof priorityConfig] : null;

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        className={cn(
          'group relative bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-primary-300 transition-all',
          (isDragging || isSortableDragging) && 'opacity-50 scale-105'
        )}
      >
        {/* Drag Handle */}
        <div 
          ref={setActivatorNodeRef}
          {...listeners}
          className="absolute left-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded z-10"
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>

        {/* Priority Indicator */}
        {priority && (
          <div className="absolute top-0 left-0 right-0 h-1 rounded-t-lg" style={{ backgroundColor: priority.color }} />
        )}

        {/* Card Content - Clickable */}
        <div onClick={() => setShowModal(true)} className="cursor-pointer p-3">
          {/* Card Title */}
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            {card.title}
          </h3>
          
          {/* Labels */}
          {card.labels && card.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {card.labels.map((label) => (
                <span
                  key={label.id}
                  className="text-xs px-2 py-0.5 rounded font-medium text-white"
                  style={{ backgroundColor: label.color }}
                >
                  {label.name}
                </span>
              ))}
            </div>
          )}

          {/* Description Preview */}
          {card.description && (
            <p className="text-xs text-gray-600 mb-2 line-clamp-2">{card.description}</p>
          )}

          {/* Card Metadata */}
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <div className="flex items-center gap-3">
              {card.dueDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(card.dueDate).toLocaleDateString()}</span>
                </div>
              )}
              
              {(card._count?.comments ?? 0) > 0 && (
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  <span>{card._count?.comments ?? 0}</span>
                </div>
              )}
              
              {(card._count?.attachments ?? 0) > 0 && (
                <div className="flex items-center gap-1">
                  <Paperclip className="w-3 h-3" />
                  <span>{card._count?.attachments ?? 0}</span>
                </div>
              )}
            </div>

            {/* Members */}
            {card.members && card.members.length > 0 && (
              <div className="flex -space-x-1.5">
                {card.members.slice(0, 3).map((member: MemberRef, index: number) => (
                  <Avatar key={member.id || index} user={member.user} size="xs" />
                ))}
                {card.members.length > 3 && (
                  <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium">
                    +{card.members.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Priority Badge (bottom) */}
          {priority && (
            <div className={cn('mt-2 px-2 py-0.5 text-xs font-medium rounded border inline-block', priority.class)}>
              {priority.text}
            </div>
          )}
        </div>
      </div>

      <CardModal card={card} open={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
