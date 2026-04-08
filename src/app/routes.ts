import { createBrowserRouter } from 'react-router';
import { Home } from './components/Home';
import { MethodDetail } from './components/MethodDetail';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Home,
  },
  {
    path: '/method/:id',
    Component: MethodDetail,
  },
  {
    path: '/admin/login',
    Component: AdminLogin,
  },
  {
    path: '/admin/dashboard',
    Component: AdminDashboard,
  },
]);