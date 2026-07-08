import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';
import App from './App.tsx';
import {AuthProvider} from './features/auth/AuthProvider';
import {DialogProvider} from './components/ui/DialogProvider';
import {ProtectedRoute} from './features/auth/ProtectedRoute';
import VerifyCredentialPage from './features/credentials/VerifyCredentialPage';
import {LanguageProvider} from './features/i18n/LanguageProvider';
import {RoleLanding} from './features/auth/RoleLanding';
import {ModeratorReviewsPage} from './features/admin/approvals/ModeratorReviewsPage';
import './i18n';
import './index.css';
import './styles/design-system.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <DialogProvider>
            <Routes>
            <Route path="/" element={<App />} />
            <Route path="/app" element={<App />} />
            <Route path="/directory" element={<App initialPortalMode="directory" />} />
            <Route path="/register" element={<App initialPortalMode="member-form" />} />
            <Route path="/signup" element={<App initialPortalMode="member-form" />} />
            <Route path="/login" element={<App initialPortalMode="admin" />} />
            <Route path="/portal" element={<App />} />
            <Route path="/portal-hub" element={<App />} />
            <Route path="/reset-password" element={<App initialPortalMode="admin" initialAuthMode="reset" />} />
            <Route path="/admin" element={<App initialPortalMode="admin" />} />
            <Route path="/auth/landing" element={<RoleLanding />} />
            <Route
              path="/admin/dashboard"
              element={(
                <ProtectedRoute requiredRole="admin">
                  <App initialPortalMode="admin" />
                </ProtectedRoute>
              )}
            />
            <Route path="/admin/reviews" element={<ModeratorReviewsPage />} />
            <Route
              path="/dashboard"
              element={(
                <ProtectedRoute requiredRole="member">
                  <App />
                </ProtectedRoute>
              )}
            />
            <Route path="/verify" element={<VerifyCredentialPage />} />
            <Route
              path="/profile"
              element={(
                <ProtectedRoute requiredRole="member">
                  <App initialPortalMode="member-tracker" />
                </ProtectedRoute>
              )}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </DialogProvider>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
