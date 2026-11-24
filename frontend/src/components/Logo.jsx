// Logoja e aplikacionit (SVG) dhe avatari i biznesit (shkronjat e para të emrit).
export function Logo() {
  return (
    <svg className="logo" viewBox="0 0 40 40" role="img" aria-label="Financa">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5b9bff" /><stop offset="1" stopColor="#1d5fd1" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#lg)" />
      <rect x="9" y="22" width="5" height="9" rx="1.5" fill="#fff" />
      <rect x="17.5" y="16" width="5" height="15" rx="1.5" fill="#fff" />
      <rect x="26" y="9" width="5" height="22" rx="1.5" fill="#fff" />
    </svg>
  );
}

export function BusinessAvatar({ name }) {
  const words = String(name || '?').trim().split(/\s+/);
  const initials = (words[0][0] + (words[1] ? words[1][0] : '')).toUpperCase();
  // ngjyrë blu e qëndrueshme sipas emrit (nuance të ndryshme për biznese të ndryshme)
  let h = 0;
  for (const ch of String(name)) h = (h * 31 + ch.charCodeAt(0)) % 60;
  return <span className="avatar" style={{ background: `hsl(${200 + h} 70% 45%)` }} aria-hidden="true">{initials}</span>;
}
