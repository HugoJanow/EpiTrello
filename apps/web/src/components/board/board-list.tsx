import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { cardsApi, listsApi } from '@/lib/api';
import { Card } from './card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, MoreVertical, Pencil, Trash2, X } from 'lucide-react';

interface BoardListProps {
  list: any;
  boardId: string;
}

export function BoardList({ list, boardId }: BoardListProps) {
  const [showAddCard, setShowAddCard] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(list.title);
  const queryClient = useQueryClient();
  const { setNodeRef } = useDroppable({ 
    id: list.id, 
    data: { listId: list.id } 
  });

  const { data: cardsData } = useQuery({
    queryKey: ['cards', list.id],
    queryFn: () => cardsApi.getCards(list.id),
  });

  const updateListMutation = useMutation({
    mutationFn: (data: { title: string }) => listsApi.updateList(list.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', boardId] });
      setIsEditingTitle(false);
    },
  });

  const deleteListMutation = useMutation({
    mutationFn: () => listsApi.deleteList(list.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', boardId] });
    },
  });

  const createCardMutation = useMutation({
    mutationFn: cardsApi.createCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', list.id] });
      setNewCardTitle('');
      setShowAddCard(false);
    },
  });

  const [newCardTitle, setNewCardTitle] = useState('');

  const handleUpdateTitle = () => {
    if (title.trim() && title !== list.title) {
      updateListMutation.mutate({ title: title.trim() });
    } else {
      setTitle(list.title);
      setIsEditingTitle(false);
    }
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;
    createCardMutation.mutate({ title: newCardTitle.trim(), listId: list.id });
  };

  const handleDeleteList = () => {
    if (confirm(`Delete list "${list.title}"? This will also delete all cards in this list.`)) {
      deleteListMutation.mutate();
    }
  };

  const cards = cardsData?.cards || [];

  return (
    <div className="flex-shrink-0 w-[300px] h-fit max-h-[calc(100vh-200px)] flex flex-col bg-white rounded-xl shadow-sm border border-gray-200">
      {/* List Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        {isEditingTitle ? (
          <form 
            onSubmit={(e) => { e.preventDefault(); handleUpdateTitle(); }}
            className="flex-1 flex gap-2"
          >
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleUpdateTitle}
              className="h-8 text-sm font-semibold"
              autoFocus
            />
          </form>
        ) : (
          <>
            <h2 
              className="font-semibold text-gray-900 flex-1 cursor-pointer hover:text-primary-600"
              onClick={() => setIsEditingTitle(true)}
            >
              {list.title}
            </h2>
            <span className="text-xs text-gray-500 mr-2">{cards.length}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditingTitle(true)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit title
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleDeleteList}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete list
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>

      {/* Cards Container */}
      <div className="flex-1 overflow-y-auto p-2">
        <SortableContext items={cards.map((c: any) => c.id)} strategy={verticalListSortingStrategy}>
          <div ref={setNodeRef} className="space-y-2 min-h-[50px]">
            {cards.map((card: any) => (
              <Card key={card.id} card={card} />
            ))}
          </div>
        </SortableContext>
      </div>

      {/* Add Card Section */}
      <div className="p-2 border-t border-gray-100">
        {showAddCard ? (
          <form onSubmit={handleAddCard} className="space-y-2">
            <Input
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              placeholder="Enter card title..."
              className="text-sm"
              autoFocus
              disabled={createCardMutation.isPending}
            />
            <div className="flex gap-2">
              <Button 
                type="submit" 
                size="sm"
                disabled={!newCardTitle.trim() || createCardMutation.isPending}
                className="flex-1"
              >
                Add Card
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  setShowAddCard(false);
                  setNewCardTitle('');
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </form>
        ) : (
          <Button
            onClick={() => setShowAddCard(true)}
            variant="ghost"
            size="sm"
            className="w-full justify-start text-gray-600 hover:bg-gray-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add a card
          </Button>
        )}
      </div>
    </div>
  );
}
