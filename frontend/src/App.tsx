import React from 'react';
import { AppRouter } from './routes/AppRouter';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ToastContainer } from './components/ui/ToastContainer';
import { AuthModal } from './components/auth/AuthModal';

export function App() {
  return (
    <ErrorBoundary>
      <AppRouter />
      <AuthModal />
      <ToastContainer />
    </ErrorBoundary>
  );
}

export default App;
