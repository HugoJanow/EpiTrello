import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useAuthStore } from './lib/auth-store';
import { ToastViewport } from './lib/toast';

// Pages
import { LoginPage } from './routes/auth/login';
import { RegisterPage } from './routes/auth/register';
import { BoardsPage } from './routes/boards';
import { BoardPage } from './routes/board';
import { ProfilePage } from './routes/profile';
import { InvitationsPage } from './routes/invitations';
import { Layout } from './components/layout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

/**
 * Protected route wrapper
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuthStore();
  
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

/**
 * Public route wrapper (redirects to boards if authenticated)
 */
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuthStore();
  
  if (accessToken) {
    return <Navigate to="/boards" replace />;
  }
  
  return <>{children}</>;
}

/**
 * Main App component
 */
export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          } />

          {/* Protected routes */}
          <Route element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path="/boards" element={<BoardsPage />} />
            <Route path="/boards/:id" element={<BoardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/invitations" element={<InvitationsPage />} />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/boards" replace />} />
          <Route path="*" element={<Navigate to="/boards" replace />} />
        </Routes>
      </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
        <ToastViewport />
    </QueryClientProvider>
  );
}
