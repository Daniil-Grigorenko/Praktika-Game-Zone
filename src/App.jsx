import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ItemDetailsPage from './pages/ItemDetailsPage';
import ExplorePage from './pages/ExplorePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import ItemCreatePage from './pages/ItemCreatePage';
import ItemEditPage from './pages/ItemEditPage';
import AdminZonesPage from './pages/AdminZonesPage';
import AdminZoneFormPage from './pages/AdminZoneFormPage';
import ForbiddenPage from './pages/ForbiddenPage';
import NotFoundPage from './pages/NotFoundPage';
import AdminUsersPage from './pages/AdminUsersPage';

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Публичные */}
        <Route index element={<HomePage />} />
        <Route path="items" element={<CatalogPage />} />
        <Route path="items/:id" element={<ItemDetailsPage />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="403" element={<ForbiddenPage />} />

        {/* Для авторизованных */}
        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="bookings/new" element={<ItemCreatePage />} />
          <Route path="bookings/:id/edit" element={<ItemEditPage />} />
        </Route>

        {/* Только для администратора */}
        <Route element={<AdminRoute />}>
          <Route path="admin/zones" element={<AdminZonesPage />} />
          <Route path="admin/zones/new" element={<AdminZoneFormPage />} />
          <Route path="admin/zones/:id/edit" element={<AdminZoneFormPage />} />
          <Route path="admin/users" element={<AdminUsersPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}