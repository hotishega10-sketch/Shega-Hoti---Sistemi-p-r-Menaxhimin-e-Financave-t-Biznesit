import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Logo, BusinessAvatar } from './Logo';
import { ROLE_LABELS } from '../utils/format';

// Menuja sipas rolit (kërkesat funksionale):
//  pronar: gjithçka + menaxhon përdoruesit; kontabilist: transaksione, klientë, fatura;
//  punonjës: vetëm shpenzimet e veta.
const MENU = {
  pronar: [
    { to: '/', label: 'Kryefaqja', end: true },
    { to: '/transaksionet', label: 'Transaksionet' },
    { to: '/klientet', label: 'Klientët' },
    { to: '/faturat', label: 'Faturat' },
    { to: '/perdoruesit', label: 'Përdoruesit' },
  ],
  kontabilist: [
    { to: '/', label: 'Kryefaqja', end: true },
    { to: '/transaksionet', label: 'Transaksionet' },
    { to: '/klientet', label: 'Klientët' },
    { to: '/faturat', label: 'Faturat' },
  ],
  punjonjes: [
    { to: '/', label: 'Kryefaqja', end: true },
    { to: '/transaksionet', label: 'Shpenzimet e mia' },
  ],
};

export default function Layout() {
  const { user, logout } = useAuth();
  const links = MENU[user.role] || MENU.punjonjes;
  return (
    <div className="shell">
      <header className="topbar">
        <NavLink to="/" className="brand" aria-label="Financa - Kryefaqja"><Logo /></NavLink>
        <div className="biz">
          <BusinessAvatar name={user.business_name} />
          <span>{user.business_name}<small>{ROLE_LABELS[user.role]}</small></span>
        </div>
        <nav className="nav" aria-label="Navigimi kryesor">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="user">
          <span className="muted">{user.email}</span>
          <button className="btn small" onClick={logout}>Dil</button>
        </div>
      </header>
      <main className="content"><Outlet /></main>
    </div>
  );
}
