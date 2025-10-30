import { useAuthStore } from './auth-store';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const { accessToken } = useAuthStore.getState();
  
  const headers: HeadersInit = {
    ...(typeof options?.body === 'string' && { 'Content-Type': 'application/json' }),
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    ...options?.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
    throw new ApiError(response.status, error.error?.message || 'Request failed', error.error?.code);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// Basic types
export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt?: string;
}

// Auth API
export const authApi = {
  register: (data: { email: string; password: string; displayName: string }) =>
    fetchApi<{ user: User; accessToken: string; refreshToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    fetchApi<{ user: User; accessToken: string; refreshToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: () => fetchApi<{ user: User }>('/auth/me'),
};

// Boards API
export const boardsApi = {
  getBoards: () => fetchApi<{ boards: unknown[] }>('/boards'),
  getBoard: (id: string) => fetchApi<unknown>(`/boards/${id}`),
  createBoard: (data: { title: string; description?: string }) =>
    fetchApi<unknown>('/boards', { method: 'POST', body: JSON.stringify(data) }),
  updateBoard: (id: string, data: { title?: string; description?: string }) =>
    fetchApi<unknown>(`/boards/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteBoard: (id: string) =>
    fetchApi<void>(`/boards/${id}`, { method: 'DELETE' }),
  inviteBoard: (boardId: string, payload: { identifier: string; role?: 'owner' | 'member' | 'viewer' }) =>
    fetchApi<{ invitedUserId: string; role: 'owner' | 'member' | 'viewer' }>(`/boards/${boardId}/invite`, { method: 'POST', body: JSON.stringify(payload) }),
};

// Lists API
export const listsApi = {
  getLists: (boardId: string) => fetchApi<{ lists: unknown[] }>(`/lists?boardId=${boardId}`),
  createList: (data: { title: string; boardId: string }) =>
    fetchApi<unknown>('/lists', { method: 'POST', body: JSON.stringify(data) }),
  updateList: (id: string, data: { title?: string; order?: number }) =>
    fetchApi<unknown>(`/lists/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteList: (id: string) => fetchApi<void>(`/lists/${id}`, { method: 'DELETE' }),
  reorderList: (data: { boardId: string; listId: string; newOrder: number }) =>
    fetchApi<void>('/lists/reorder', { method: 'POST', body: JSON.stringify(data) }),
};

// Cards API
export const cardsApi = {
  getCards: (listId: string) => fetchApi<{ cards: unknown[] }>(`/cards?listId=${listId}`),
  getCard: (id: string) => fetchApi<unknown>(`/cards/${id}`),
  createCard: (data: unknown) =>
    fetchApi<unknown>('/cards', { method: 'POST', body: JSON.stringify(data) }),
  updateCard: (id: string, data: unknown) =>
    fetchApi<unknown>(`/cards/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteCard: (id: string) => fetchApi<void>(`/cards/${id}`, { method: 'DELETE' }),
  reorderCard: (data: { cardId: string; listId: string; newOrder: number }) =>
    fetchApi<void>('/cards/reorder', { method: 'POST', body: JSON.stringify(data) }),
  addMember: (cardId: string, userId: string) =>
    fetchApi<unknown>(`/cards/${cardId}/members`, { method: 'POST', body: JSON.stringify({ userId }) }),
  removeMember: (cardId: string, userId: string) =>
    fetchApi<void>(`/cards/${cardId}/members/${userId}`, { method: 'DELETE' }),
  addLabel: (cardId: string, data: { name: string; color: string }) =>
    fetchApi<unknown>(`/cards/${cardId}/labels`, { method: 'POST', body: JSON.stringify(data) }),
  removeLabel: (cardId: string, labelId: string) =>
    fetchApi<void>(`/cards/${cardId}/labels/${labelId}`, { method: 'DELETE' }),
};

// Users API
export const usersApi = {
  getMe: () => fetchApi<{ user: User }>('/users/me'),
  updateMe: (data: { displayName?: string; avatarUrl?: string | null }) =>
    fetchApi<{ user: User }>('/users/me', { method: 'PUT', body: JSON.stringify(data) }),
  uploadAvatar: async (file: File) => {
    const { accessToken } = useAuthStore.getState();
    const fd = new FormData();
    fd.append('avatar', file, file.name);

    const res = await fetch(`${API_URL}/users/me/avatar`, {
      method: 'POST',
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: fd,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: { message: 'Upload failed' } }));
      throw new Error(error.error?.message || 'Upload failed');
    }

    return res.json();
  },
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    fetchApi<{ ok: boolean }>('/users/password', { method: 'PUT', body: JSON.stringify(data) }),
  deleteMe: () => fetchApi<void>('/users/me', { method: 'DELETE' }),
};

// Invitations API
export const invitationsApi = {
  getMyInvitations: () => fetchApi<{ invitations: unknown[] }>('/users/me/invitations'),
  acceptInvitation: (id: string) => fetchApi<{ ok: boolean }>(`/invitations/${id}/accept`, { method: 'POST' }),
  declineInvitation: (id: string) => fetchApi<{ ok: boolean }>(`/invitations/${id}/decline`, { method: 'POST' }),
  revokeInvitation: (id: string) => fetchApi<{ ok: boolean }>(`/invitations/${id}/revoke`, { method: 'POST' }),
};

