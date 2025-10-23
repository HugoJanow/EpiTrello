import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { boardsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Folder, X, MoreVertical, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { createToast } from '@/lib/toast';

export function BoardsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['boards'],
    queryFn: () => boardsApi.getBoards(),
  });

  const createMutation = useMutation({
    mutationFn: boardsApi.createBoard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      setTitle('');
      setDescription('');
      setShowCreate(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => boardsApi.deleteBoard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      createToast({ title: 'Board deleted', description: 'The board was removed', type: 'success' });
    },
    onError: () => {
      createToast({ title: 'Delete failed', description: 'Could not delete the board', type: 'error' });
    },
  });
  const [deletingBoard, setDeletingBoard] = useState<{ id: string; title: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    createMutation.mutate({ title: title.trim(), description: description.trim() || undefined });
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading boards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent mb-2">
              My Boards
            </h1>
            <p className="text-gray-600">Organize your work with boards, lists, and cards</p>
          </div>
          <Button onClick={() => setShowCreate(true)} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Create Board
          </Button>
        </div>

        {/* Create Board Form */}
        {showCreate && (
          <div className="mb-8 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Create New Board</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowCreate(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Board Title *
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Project Tasks, Team Roadmap..."
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this board about?"
                  className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={!title.trim() || createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Board'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Boards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data?.boards.map((board: any) => (
            <div key={board.id} className="relative">
              <Link
                to={`/boards/${board.id}`}
                className="group relative block bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden h-32"
              >
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                <div className="relative h-full p-5 flex flex-col justify-between text-white">
                  <div>
                    <h3 className="text-lg font-bold mb-1 line-clamp-2">{board.title}</h3>
                    {board.description && (
                      <p className="text-sm text-white/80 line-clamp-1">{board.description}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-white/70">
                    <div className="flex items-center gap-1">
                      <Folder className="w-3 h-3" />
                      <span>Board</span>
                    </div>
                    <span>{new Date(board.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="absolute inset-0 ring-2 ring-transparent group-hover:ring-primary-400 rounded-xl transition-all" />
              </Link>

              {/* Menu */}
              <div className="absolute top-2 right-2 z-20">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 rounded bg-white/20 hover:bg-white/30">
                      <MoreVertical className="w-4 h-4 text-white" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => { window.location.href = `/boards/${board.id}`; }}>
                      Open
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setDeletingBoard({ id: board.id, title: board.title })} className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-2 inline" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}

          {/* Empty State / Create Button */}
          {data?.boards.length === 0 && !showCreate && (
            <div className="col-span-full flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <Folder className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No boards yet</h3>
              <p className="text-gray-500 mb-6">Create your first board to get started</p>
              <Button onClick={() => setShowCreate(true)} size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Board
              </Button>
            </div>
          )}
        </div>
        <ConfirmDialog
          open={!!deletingBoard}
          onOpenChange={(v) => { if (!v) setDeletingBoard(null); }}
          title={deletingBoard ? `Delete "${deletingBoard.title}"?` : 'Delete board?'}
          description="This action cannot be undone. All lists and cards inside will be removed."
          onConfirm={() => {
            if (!deletingBoard) return;
            deleteMutation.mutate(deletingBoard.id);
            setDeletingBoard(null);
          }}
        />
      </div>
    </div>
  );
}
