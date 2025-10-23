import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay, 
  DragStartEvent,
  DragOverEvent,
  PointerSensor, 
  useSensor, 
  useSensors,
  closestCorners
} from '@dnd-kit/core';
// arrayMove not used in this file (kept in other components)
import { useState } from 'react';
import { boardsApi, listsApi, cardsApi } from '@/lib/api';
import { BoardList } from '@/components/board/board-list';
import { Card } from '@/components/board/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, ArrowLeft, X, MoreHorizontal, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { createToast } from '@/lib/toast';

export function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeCard, setActiveCard] = useState<any>(null);
  const [showNewList, setShowNewList] = useState(false);

  // Configure sensors for better drag experience
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    })
  );

  const { data: board, isLoading: boardLoading } = useQuery({
    queryKey: ['board', id],
    queryFn: () => boardsApi.getBoard(id!),
    enabled: !!id,
  });

  const { data: listsData, isLoading: listsLoading } = useQuery({
    queryKey: ['lists', id],
    queryFn: () => listsApi.getLists(id!),
    enabled: !!id,
  });

  const deleteBoard = useMutation({
    mutationFn: (boardId: string) => boardsApi.deleteBoard(boardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      createToast({ title: 'Board deleted', description: 'The board was removed', type: 'success' });
      navigate('/boards');
    },
    onError: () => {
      createToast({ title: 'Delete failed', description: 'Could not delete the board', type: 'error' });
    },
  });
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = active.data.current?.card;
    setActiveCard(card);
  };

  const handleDragOver = (_event: DragOverEvent) => {
    // For now, we don't need special handling during drag over
    // The visual feedback comes from DnD Kit automatically
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const activeCard = active.data.current?.card;
    if (!activeCard) return;

    // Determine the target list ID and order
    let targetListId: string | undefined;
    let targetOrder = Date.now(); // Use timestamp as a simple ordering strategy

    // Check if dropped on another card
    if (over.data.current?.card) {
      const overCard = over.data.current.card;
      targetListId = overCard.listId;
      targetOrder = overCard.order - 0.5; // Insert before the card
    } 
    // Check if dropped on a list droppable area
    else if (over.data.current?.listId) {
      targetListId = over.data.current.listId;
    }
    // Otherwise it's the list ID itself
    else {
      targetListId = over.id as string;
    }

    // Don't do anything if nothing changed
    if (!targetListId || (activeCard.listId === targetListId && !over.data.current?.card)) {
      return;
    }

    console.log('Moving card:', {
      cardId: activeCard.id,
      from: activeCard.listId,
      to: targetListId,
      order: targetOrder
    });

    try {
      await cardsApi.reorderCard({
        cardId: activeCard.id,
        listId: targetListId,
        newOrder: targetOrder,
      });
      
      // Refresh all cards
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    } catch (error) {
      console.error('Failed to move card:', error);
    }
  };

  if (boardLoading || listsLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading board...</p>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Board not found</p>
          <Button onClick={() => navigate('/boards')}>
            <ArrowLeft className="w-4 h-4" />
            Back to Boards
          </Button>
        </div>
      </div>
    );
  }

  const lists = listsData?.lists || [];

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/boards')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
            {board.title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded hover:bg-slate-100/50">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => navigate(`/boards/${id}/settings`)}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setConfirmOpen(true)} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2 inline" /> Delete board
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Board Content */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="h-full p-6">
            <div className="flex gap-4 h-full pb-6">
              {lists.map((list: any) => (
                <BoardList key={list.id} list={list} boardId={id!} />
              ))}

              {/* Add List Button/Form */}
              <div className="flex-shrink-0">
                {showNewList ? (
                  <CreateListForm 
                    boardId={id!} 
                    onClose={() => setShowNewList(false)} 
                  />
                ) : (
                  <Button
                    onClick={() => setShowNewList(true)}
                    variant="ghost"
                    className="h-auto min-h-[120px] w-[300px] border-2 border-dashed border-gray-300 hover:border-primary-400 hover:bg-white/60 flex-col gap-2 transition-all"
                  >
                    <Plus className="w-6 h-6 text-gray-600" />
                    <span className="text-gray-600 font-medium">Add a list</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          <DragOverlay>
            {activeCard ? <Card card={activeCard} isDragging /> : null}
          </DragOverlay>
        </DndContext>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Delete this board?`}
        description="This action cannot be undone. All lists and cards inside will be removed."
        onConfirm={() => deleteBoard.mutate(id!)}
      />
    </div>
  );
}

function CreateListForm({ boardId, onClose }: { boardId: string; onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isCreating) return;

    setIsCreating(true);
    try {
      await listsApi.createList({ title: title.trim(), boardId });
      queryClient.invalidateQueries({ queryKey: ['lists', boardId] });
      setTitle('');
      onClose();
    } catch (error) {
      console.error('Failed to create list:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="w-[300px] bg-white rounded-lg shadow-lg border border-gray-200 p-3">
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter list title..."
          className="font-medium"
          autoFocus
          disabled={isCreating}
        />
        <div className="flex gap-2">
          <Button 
            type="submit" 
            size="sm"
            disabled={!title.trim() || isCreating}
            className="flex-1"
          >
            {isCreating ? 'Creating...' : 'Add List'}
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="icon"
            onClick={onClose}
            disabled={isCreating}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
