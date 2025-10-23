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
    ...(options?.body && { 'Content-Type': 'application/json' }),
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

// Auth API
export const authApi = {
  register: (data: { email: string; password: string; displayName: string }) =>
    fetchApi<{ user: any; accessToken: string; refreshToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    fetchApi<{ user: any; accessToken: string; refreshToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: () => fetchApi<{ user: any }>('/auth/me'),
};

// Boards API
export const boardsApi = {
  getBoards: () => fetchApi<{ boards: any[] }>('/boards'),
  getBoard: (id: string) => fetchApi<any>(`/boards/${id}`),
  createBoard: (data: { title: string; description?: string }) =>
    fetchApi<any>('/boards', { method: 'POST', body: JSON.stringify(data) }),
  updateBoard: (id: string, data: { title?: string; description?: string }) =>
    fetchApi<any>(`/boards/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteBoard: (id: string) =>
    fetchApi<void>(`/boards/${id}`, { method: 'DELETE' }),
};

// Lists API
export const listsApi = {
  getLists: (boardId: string) => fetchApi<{ lists: any[] }>(`/lists?boardId=${boardId}`),
  createList: (data: { title: string; boardId: string }) =>
    fetchApi<any>('/lists', { method: 'POST', body: JSON.stringify(data) }),
  updateList: (id: string, data: { title?: string; order?: number }) =>
    fetchApi<any>(`/lists/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteList: (id: string) => fetchApi<void>(`/lists/${id}`, { method: 'DELETE' }),
  reorderList: (data: { boardId: string; listId: string; newOrder: number }) =>
    fetchApi<void>('/lists/reorder', { method: 'POST', body: JSON.stringify(data) }),
};

// Cards API
export const cardsApi = {
  getCards: (listId: string) => fetchApi<{ cards: any[] }>(`/cards?listId=${listId}`),
  getCard: (id: string) => fetchApi<any>(`/cards/${id}`),
  createCard: (data: any) =>
    fetchApi<any>('/cards', { method: 'POST', body: JSON.stringify(data) }),
  updateCard: (id: string, data: any) =>
    fetchApi<any>(`/cards/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteCard: (id: string) => fetchApi<void>(`/cards/${id}`, { method: 'DELETE' }),
  reorderCard: (data: { cardId: string; listId: string; newOrder: number }) =>
    fetchApi<void>('/cards/reorder', { method: 'POST', body: JSON.stringify(data) }),
  addMember: (cardId: string, userId: string) =>
    fetchApi<any>(`/cards/${cardId}/members`, { method: 'POST', body: JSON.stringify({ userId }) }),
  removeMember: (cardId: string, userId: string) =>
    fetchApi<void>(`/cards/${cardId}/members/${userId}`, { method: 'DELETE' }),
  addLabel: (cardId: string, data: { name: string; color: string }) =>
    fetchApi<any>(`/cards/${cardId}/labels`, { method: 'POST', body: JSON.stringify(data) }),
  removeLabel: (cardId: string, labelId: string) =>
    fetchApi<void>(`/cards/${cardId}/labels/${labelId}`, { method: 'DELETE' }),
};
