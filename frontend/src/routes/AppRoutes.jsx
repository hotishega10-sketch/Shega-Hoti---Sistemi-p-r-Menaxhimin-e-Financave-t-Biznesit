import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';
import { Loading } from '../components/ui';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import TransactionsPage from '../pages/TransactionsPage';
import ClientsPage from '../pages/ClientsPage';
import InvoicesPage from '../pages/InvoicesPage';
import UsersPage from '../pages/UsersPage';

// Faqe të mbrojtura: pa përdorues te login; me rol të gabuar te kryefaqja.
function Protected({ roles, children }) {
  const { user, loading, canManage, isOwner } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/hyrja" replace />;
  if (roles === 'manage' && !canManage) return <Navigate to="/" replace />;
  if (roles === 'owner' && !isOwner) return <Navigate to="/" replace />;
  return children;
}

function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  return user ? <Navigate to="/" replace /> : children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/hyrja" element={<GuestOnly><LoginPage /></GuestOnly>} />
      <Route path="/regjistrimi" element={<GuestOnly><RegisterPage /></GuestOnly>} />
      <Route element={<Protected><Layout /></Protected>}>
        <Route index element={<DashboardPage />} />
        <Route path="transaksionet" element={<TransactionsPage />} />
        <Route path="klientet" element={<Protected roles="manage"><ClientsPage /></Protected>} />
        <Route path="faturat" element={<Protected roles="manage"><InvoicesPage /></Protected>} />
        <Route path="perdoruesit" element={<Protected roles="owner"><UsersPage /></Protected>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
