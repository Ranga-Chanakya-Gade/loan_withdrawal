// Not used in ROPC flow — kept as a safe fallback redirect.
import { Navigate } from 'react-router-dom';
export function OAuthCallbackPage() {
  return <Navigate to="/login" replace />;
}
