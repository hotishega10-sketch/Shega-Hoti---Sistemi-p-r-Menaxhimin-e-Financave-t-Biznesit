import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLE_LABELS } from '../utils/format';

export default function Layout() {
  const { user, logout, canManage } = useAuth();
  const links = [
    { to: '/', label: 'Kryefaqja', end: true },
    { to: '/transaksionet', label: 'Transaksionet' },
    ...(canManage ? [{ to: '/klientet', label: 'Klientët' }, { to: '/faturat', label: 'Faturat' }] : []),
  ];
  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">Financa<small>{user.business_name}</small></div>
        <nav className="nav" aria-label="Navigimi kryesor">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="user">
          <span className="muted">{user.email} · {ROLE_LABELS[user.role]}</span>
          <button className="btn small" onClick={logout}>Dil</button>
        </div>
      </header>
      <main className="content"><Outlet /></main>
    </div>
  );
}
