import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './common/Spinner';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner fullPage />;

  if (!user) {
    // запоминаем, куда хотел попасть пользователь (путь + query + hash)
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}