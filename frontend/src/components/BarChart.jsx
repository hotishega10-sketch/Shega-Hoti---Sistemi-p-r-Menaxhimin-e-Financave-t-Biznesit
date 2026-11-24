import { money, monthLabel } from '../utils/format';

// Grafik i thjeshtë SVG: të hyra (jeshile) dhe shpenzime (e kuqe) për 6 muajt e fundit.
export default function BarChart({ data }) {
  const W = 360, H = 170, PAD = 22, BASE = H - 24;
  const max = Math.max(1, ...data.flatMap((d) => [Number(d.income), Number(d.expense)]));
  const slot = (W - PAD) / data.length;
  const h = (v) => (Number(v) / max) * (BASE - 14);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img"
      aria-label="Të hyrat dhe shpenzimet për 6 muajt e fundit">
      <line x1={PAD / 2} x2={W} y1={BASE} y2={BASE} className="axis" />
      {data.map((d, i) => {
        const x = PAD / 2 + i * slot + slot / 2;
        return (
          <g key={d.month}>
            <rect x={x - 14} y={BASE - h(d.income)} width="12" height={h(d.income)} rx="2" className="bar-inc">
              <title>{`${d.month}: të hyra ${money(d.income)}`}</title>
            </rect>
            <rect x={x + 2} y={BASE - h(d.expense)} width="12" height={h(d.expense)} rx="2" className="bar-exp">
              <title>{`${d.month}: shpenzime ${money(d.expense)}`}</title>
            </rect>
            <text x={x} y={H - 6} textAnchor="middle" className="axis-label">{monthLabel(d.month)}</text>
          </g>
        );
      })}
    </svg>
  );
}
