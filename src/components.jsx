import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { fmt, fmtDate } from './utils.js';

/* ============ Icons (line) ============ */
export const Icon = ({ name, size = 16, stroke = 1.6 }) => {
  const s = size;
  const common = {
    width: s, height: s, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round",
    className: "ic",
  };
  const paths = {
    home:    <><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /></>,
    wallet:  <><rect x="3" y="6" width="18" height="14" rx="2" /><path d="M16 12h4" /><path d="M3 8h13a2 2 0 0 1 2 2v3" /></>,
    chart:   <><path d="M4 20V8" /><path d="M10 20v-6" /><path d="M16 20V4" /><path d="M22 20v-9" /></>,
    insight: <><circle cx="12" cy="12" r="3" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    cog:     <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h0a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></>,
    search:  <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
    plus:    <><path d="M12 5v14M5 12h14" /></>,
    close:   <><path d="M18 6 6 18M6 6l12 12" /></>,
    chev:    <><path d="m6 9 6 6 6-6" /></>,
    chevr:   <><path d="m9 18 6-6-6-6" /></>,
    sun:     <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    moon:    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />,
    bell:    <><path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9" /><path d="M10 21a2 2 0 0 0 4 0" /></>,
    filter:  <><path d="M3 5h18M6 12h12M10 19h4" /></>,
    arrow:   <path d="M5 12h14M13 6l6 6-6 6" />,
    arrowd:  <><path d="M12 5v14" /><path d="M19 12l-7 7-7-7" /></>,
    arrowu:  <><path d="M12 19V5" /><path d="M5 12l7-7 7 7" /></>,
    save:    <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18" /><circle cx="8" cy="15" r="1" /></>,
    card:    <><rect x="2" y="6" width="20" height="13" rx="2" /><path d="M2 10h20" /></>,
    coin:    <><circle cx="12" cy="12" r="9" /><path d="M9 12h6M12 9v6" /></>,
    grow:    <><path d="M3 17l6-6 4 4 8-8" /><path d="M14 7h7v7" /></>,
    download:<><path d="M12 4v12" /><path d="M6 10l6 6 6-6" /><path d="M4 20h16" /></>,
    dots:    <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
    pin:     <><path d="M12 21s-7-7.5-7-12a7 7 0 0 1 14 0c0 4.5-7 12-7 12z" /><circle cx="12" cy="9" r="2.5" /></>,
    menu:    <><path d="M4 6h16M4 12h16M4 18h16" /></>,
  };
  return <svg {...common}>{paths[name] || null}</svg>;
};

/* ============ Card ============ */
export const Card = ({ children, className = "", title, eyebrow, right, padding = true, thick = false, style }) => (
  <div className={`card ${thick ? "thick" : ""} ${className}`} style={style}>
    {(title || eyebrow || right) && (
      <div className="cardhead">
        <div>
          {eyebrow && <div className="h-eyebrow">{eyebrow}</div>}
          {title && <div className="h-card" style={{ marginTop: eyebrow ? 6 : 0 }}>{title}</div>}
        </div>
        {right}
      </div>
    )}
    {children && (padding ? <div className="cardbody">{children}</div> : children)}
  </div>
);

/* ============ Delta ============ */
export const Delta = ({ value, format = "pct", showSign = true }) => {
  const cls = value > 0.0005 ? "up" : value < -0.0005 ? "dn" : "flat";
  const text = format === "pct"
    ? fmtPctLocal(value, { sign: showSign })
    : (value > 0 ? "+" : "") + fmt(value);
  return <span className={`delta ${cls}`}>{text}</span>;
};

function fmtPctLocal(n, opts = {}) {
  const dec = opts.dec != null ? opts.dec : 1;
  const sign = (opts.sign && n > 0) ? "+" : "";
  return sign + (n * 100).toFixed(dec) + "%";
}

/* ============ Sparkline ============ */
export const Sparkline = ({ data, width = 96, height = 28, stroke = 1.5, filled = true }) => {
  if (!data || data.length === 0) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 2;
  const w = width, h = height;
  const x = i => pad + (i / (data.length - 1)) * (w - pad * 2);
  const y = v => pad + (1 - (v - min) / range) * (h - pad * 2);
  const d = data.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(2)} ${y(v).toFixed(2)}`).join(" ");
  const dFill = `${d} L ${x(data.length - 1).toFixed(2)} ${h - pad} L ${x(0).toFixed(2)} ${h - pad} Z`;
  const id = "spk_" + Math.random().toString(36).slice(2, 8);
  return (
    <svg className="spark" width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {filled && (
        <>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="currentColor" stopOpacity="0.22" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={dFill} fill={`url(#${id})`} />
        </>
      )}
      <path d={d} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/* ============ Area chart with hover tooltip ============ */
export const AreaChart = ({ labels, series, height = 220, formatY = (v) => fmt(v, { compact: true }) }) => {
  const wrapRef = useRef(null);
  const [hover, setHover] = useState(null);
  const [w, setW] = useState(640);

  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(entries => {
      for (const e of entries) setW(e.contentRect.width);
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const padL = 44, padR = 14, padT = 14, padB = 26;
  const innerW = Math.max(40, w - padL - padR);
  const innerH = height - padT - padB;
  const len = labels.length;
  const all = series.flatMap(s => s.data);
  const min = 0;
  const max = Math.max(...all) * 1.1;
  const xAt = i => padL + (i / (len - 1)) * innerW;
  const yAt = v => padT + (1 - (v - min) / (max - min)) * innerH;

  const gridCount = 4;
  const gridVals = [];
  for (let i = 0; i <= gridCount; i++) gridVals.push(min + (max - min) * (i / gridCount));

  const handleMove = (e) => {
    const rect = wrapRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const idx = Math.round(((px - padL) / innerW) * (len - 1));
    if (idx >= 0 && idx < len) setHover({ i: idx, x: xAt(idx), y: yAt(series[0].data[idx]) });
  };
  const handleLeave = () => setHover(null);

  return (
    <div ref={wrapRef} style={{ position: "relative", width: "100%" }} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`}>
        <defs>
          <linearGradient id="ac-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--accent)" stopOpacity="0.28" />
            <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {gridVals.map((v, i) => (
          <g key={i}>
            <line x1={padL} x2={w - padR} y1={yAt(v)} y2={yAt(v)} stroke="var(--line-1)" strokeWidth="1" />
            <text className="axis-label" x={padL - 8} y={yAt(v) + 3} textAnchor="end">{formatY(v)}</text>
          </g>
        ))}
        {labels.map((lab, i) => (
          (i % Math.ceil(len / 6) === 0 || i === len - 1) && (
            <text key={i} className="axis-label" x={xAt(i)} y={height - 8} textAnchor="middle">{lab}</text>
          )
        ))}
        {series.map((s, si) => {
          const pts = s.data.map((v, i) => `${i === 0 ? "M" : "L"} ${xAt(i).toFixed(2)} ${yAt(v).toFixed(2)}`).join(" ");
          const fillPath = `${pts} L ${xAt(len - 1)} ${yAt(0)} L ${xAt(0)} ${yAt(0)} Z`;
          return (
            <g key={si} style={{ color: s.primary ? "var(--accent-strong)" : "var(--text-3)" }}>
              {s.primary && <path d={fillPath} fill="url(#ac-fill)" />}
              <path d={pts} fill="none" stroke="currentColor" strokeWidth={s.primary ? 2 : 1.2}
                    strokeLinecap="round" strokeLinejoin="round"
                    strokeDasharray={s.dashed ? "3 4" : undefined} />
            </g>
          );
        })}
        {hover && (
          <g>
            <line x1={hover.x} x2={hover.x} y1={padT} y2={height - padB} stroke="var(--line-3)" strokeWidth="1" strokeDasharray="2 3" />
            {series.map((s, si) => (
              <circle key={si} cx={hover.x} cy={yAt(s.data[hover.i])} r={s.primary ? 4 : 3}
                fill={s.primary ? "var(--accent)" : "var(--bg-0)"}
                stroke={s.primary ? "var(--bg-0)" : "var(--text-3)"} strokeWidth="1.5" />
            ))}
          </g>
        )}
      </svg>
      {hover && (
        <div className="tt" style={{ left: hover.x, top: yAt(series[0].data[hover.i]) }}>
          <div className="lbl">{labels[hover.i]}</div>
          {series.map((s, si) => (
            <div key={si} className="val">{s.name}: {fmt(s.data[hover.i], { compact: true })}</div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ============ Bar chart (paired bars) ============ */
export const BarPairs = ({ rows, height = 240, max }) => {
  const wrapRef = useRef(null);
  const [w, setW] = useState(640);
  const [hover, setHover] = useState(null);

  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(entries => { for (const e of entries) setW(e.contentRect.width); });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const padL = 14, padR = 14, padT = 14, padB = 36;
  const innerW = Math.max(40, w - padL - padR);
  const innerH = height - padT - padB;
  const realMax = max || Math.max(...rows.flatMap(r => [r.a, r.b])) * 1.15;
  const slot = innerW / rows.length;
  const barW = Math.min(18, slot * 0.32);
  const yAt = v => padT + (1 - v / realMax) * innerH;

  return (
    <div ref={wrapRef} style={{ position: "relative", width: "100%" }}>
      <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`}>
        {[0, 0.5, 1].map((t, i) => (
          <line key={i} x1={padL} x2={w - padR} y1={padT + innerH * (1 - t)} y2={padT + innerH * (1 - t)} stroke="var(--line-1)" />
        ))}
        {rows.map((r, i) => {
          const cx = padL + slot * i + slot / 2;
          const ax = cx - barW - 2;
          const bx = cx + 2;
          return (
            <g key={r.label} onMouseEnter={() => setHover({ i, r, x: cx, y: yAt(Math.max(r.a, r.b)) })}
               onMouseLeave={() => setHover(null)}>
              <rect x={ax} y={yAt(r.b)} width={barW} height={innerH - (yAt(r.b) - padT)} fill="var(--line-2)" rx="2" />
              <rect x={bx} y={yAt(r.a)} width={barW} height={innerH - (yAt(r.a) - padT)} fill="var(--accent)" rx="2" />
              <text className="axis-label" x={cx} y={height - 18} textAnchor="middle">{r.label.slice(0, 3)}</text>
              <text className="axis-label" x={cx} y={height - 6} textAnchor="middle" style={{ opacity: 0.6 }}>
                {fmt(r.a, { compact: true })}
              </text>
            </g>
          );
        })}
      </svg>
      {hover && (
        <div className="tt" style={{ left: hover.x, top: hover.y }}>
          <div className="lbl">{hover.r.label}</div>
          <div className="val">This: {fmt(hover.r.a)}</div>
          <div className="val muted">Prev: {fmt(hover.r.b)}</div>
        </div>
      )}
    </div>
  );
};

/* ============ Donut ============ */
export const Donut = ({ data, size = 180, thickness = 22 }) => {
  const wrapRef = useRef(null);
  const [hover, setHover] = useState(null);
  const total = data.reduce((s, d) => s + d.value, 0);
  const cx = size / 2, cy = size / 2;
  const r = (size - thickness) / 2;
  let acc = 0;
  const tones = data.map((_, i) => {
    const t = 0.95 - (i / Math.max(1, data.length - 1)) * 0.65;
    const base = i % 2 === 0 ? "var(--accent)" : "var(--text-1)";
    return `color-mix(in oklab, ${base} ${(t * 100).toFixed(0)}%, transparent)`;
  });

  return (
    <div ref={wrapRef} style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {data.map((d, i) => {
          const frac = d.value / total;
          const startA = (acc / total) * Math.PI * 2 - Math.PI / 2;
          acc += d.value;
          const endA = (acc / total) * Math.PI * 2 - Math.PI / 2;
          const large = frac > 0.5 ? 1 : 0;
          const x0 = cx + r * Math.cos(startA);
          const y0 = cy + r * Math.sin(startA);
          const x1 = cx + r * Math.cos(endA);
          const y1 = cy + r * Math.sin(endA);
          const dPath = `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
          const isHover = hover === i;
          return (
            <path key={d.label} d={dPath} fill="none"
              stroke={tones[i]}
              strokeWidth={isHover ? thickness + 4 : thickness}
              strokeLinecap="butt"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{ transition: "stroke-width 0.15s", cursor: "pointer" }}
            />
          );
        })}
        <text x={cx} y={cy - 4} textAnchor="middle" style={{ fontSize: 11, fill: "var(--text-3)", letterSpacing: "0.08em" }}>
          {hover != null ? data[hover].label.toUpperCase() : "TOTAL"}
        </text>
        <text x={cx} y={cy + 16} textAnchor="middle" className="mono"
              style={{ fontSize: 16, fill: hover != null ? "var(--accent-strong)" : "var(--text-0)", fontWeight: 500 }}>
          {hover != null ? fmt(data[hover].value, { compact: true }) : fmt(total, { compact: true })}
        </text>
      </svg>
    </div>
  );
};

/* ============ Stacked horizontal bar ============ */
export const StackBar = ({ data, height = 10 }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div style={{ display: "flex", width: "100%", height, borderRadius: 4, overflow: "hidden", border: "1px solid var(--line-1)" }}>
      {data.map((d, i) => {
        const t = 0.95 - (i / Math.max(1, data.length - 1)) * 0.65;
        const base = i % 2 === 0 ? "var(--accent)" : "var(--text-1)";
        return (
          <div key={d.label} title={`${d.label} · ${(d.value / total * 100).toFixed(0)}%`}
            style={{
              flex: `${(d.value / total) * 100} 1 0`,
              background: `color-mix(in oklab, ${base} ${(t * 100).toFixed(0)}%, transparent)`,
              borderRight: i < data.length - 1 ? "1px solid var(--bg-0)" : "none",
            }}
          />
        );
      })}
    </div>
  );
};

/* ============ Progress ============ */
export const Progress = ({ value, max, height = 5 }) => {
  const pct = Math.min(1, value / max);
  const over = value > max;
  return (
    <div style={{ position: "relative", width: "100%", height, background: "var(--line-1)", borderRadius: 999, overflow: "hidden" }}>
      <div style={{
        width: `${Math.min(100, pct * 100)}%`, height: "100%",
        background: over ? "repeating-linear-gradient(45deg, var(--accent) 0 4px, var(--accent-strong) 4px 8px)" : "var(--accent)",
        transition: "width 0.4s ease",
      }} />
    </div>
  );
};

/* ============ Top bar list ============ */
export const TopBarList = ({ items, limit = 8, valueFmt = (v) => fmt(v, { compact: true }), onClick }) => {
  const max = Math.max(...items.map(i => i.value), 1);
  const shown = items.slice(0, limit);
  return (
    <div>
      {shown.map((it, i) => (
        <div key={it.label + i} onClick={onClick ? () => onClick(it) : undefined}
          style={{
            display: "grid", gridTemplateColumns: "20px 1fr auto", gap: 12, alignItems: "center",
            padding: "10px 0", borderTop: i ? "1px solid var(--line-1)" : "0",
            cursor: onClick ? "pointer" : "default",
          }}>
          <span className="mono soft" style={{ fontSize: 11, textAlign: "right" }}>{(i + 1).toString().padStart(2, "0")}</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.label}</span>
              {it.secondary != null && <span className="muted mono" style={{ fontSize: 11 }}>{it.secondary}</span>}
            </div>
            <div style={{ marginTop: 6, height: 4, background: "var(--line-1)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ width: `${(it.value / max) * 100}%`, height: "100%", background: "var(--accent)" }} />
            </div>
            {it.count != null && (
              <div className="muted mono" style={{ fontSize: 10.5, marginTop: 4 }}>
                {it.count} {it.count === 1 ? "transaction" : "transactions"}
                {it.avg != null && ` · avg ${fmt(it.avg, { compact: true })}`}
              </div>
            )}
          </div>
          <div className="mono tnum" style={{ fontSize: 13.5, fontWeight: 500, textAlign: "right" }}>
            {valueFmt(it.value)}
          </div>
        </div>
      ))}
    </div>
  );
};

/* ============ Range picker ============ */
export const RangePicker = ({ value, onChange, options }) => (
  <div className="segmented">
    {options.map(o => (
      <button key={o.value} className={value === o.value ? "active" : ""} onClick={() => onChange(o.value)}>
        {o.label}
      </button>
    ))}
  </div>
);

/* ============ Aggregation helper ============ */
export const aggregate = (txns, keyFn, labelFn) => {
  const map = {};
  for (const t of txns) {
    const k = keyFn(t);
    if (!map[k]) map[k] = { label: labelFn(t), value: 0, count: 0, lastDate: null, parentCat: (CAT_META[t.cat] || {}).name };
    map[k].value += Math.abs(t.amount);
    map[k].count += 1;
    if (!map[k].lastDate || t.date > map[k].lastDate) map[k].lastDate = fmtDate(t.date);
  }
  return Object.values(map).sort((a, b) => b.value - a.value);
};

/* ============ Category meta ============ */
export const CAT_META = {
  groc:    { name: "Groceries",     glyph: "GR" },
  rent:    { name: "Housing",       glyph: "HO" },
  trans:   { name: "Transport",     glyph: "TR" },
  dining:  { name: "Dining",        glyph: "DI" },
  util:    { name: "Utilities",     glyph: "UT" },
  ent:     { name: "Entertainment", glyph: "EN" },
  shop:    { name: "Shopping",      glyph: "SH" },
  health:  { name: "Health",        glyph: "HE" },
  travel:  { name: "Travel",        glyph: "TV" },
  other:   { name: "Other",         glyph: "OT" },
  income:  { name: "Income",        glyph: "+" },
  transfer:{ name: "Transfer",      glyph: "↔" },
};
