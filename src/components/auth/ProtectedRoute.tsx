import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { DXC } from '../../theme/dxcTheme';

interface Props {
  children: ReactNode;
}

/**
 * ProtectedRoute
 *
 * Wraps all authenticated routes. While the auth state is loading (session
 * restore from sessionStorage) it shows a full-screen spinner to prevent
 * a flash of the login redirect. Once resolved:
 *  - Authenticated → renders children
 *  - Unauthenticated → redirects to /login, preserving the intended path
 */
export function ProtectedRoute({ children }: Props) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: DXC.midnightBlue,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={32} sx={{ color: DXC.sky }} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?returnTo=${returnTo}`} replace />;
  }

  return <>{children}</>;
}
