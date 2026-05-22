import { useState, useMemo } from 'react';
import { DATA } from '../data.js';
import { fmt, fmtPct, fmtDate } from '../utils.js';
import { Icon, Card, Delta, AreaChart, Donut, TopBarList, RangePicker, Sparkline, aggregate, CAT_META } from '../components.jsx';

const RANGE_OPTS = [
  { value: "cycle",     label: "This cycle" },
  { value: "lastcycle", label: "Last cycle" },
  { value: "3m",        label: "3M" },
  { value: "6m",        label: "6M" },
  { value: "ytd",       label: "YTD" },
];

function inRange(t, range, card) {
  const d = new Date(t.date);
  const today = new Date("2026-05-20");
  if (range === "cycle") {
    return d >= new Date(card.cycleStart) && d <= today;
  }
  if (range === "lastcycle") {
    const start = new Date(card.cycleStart); start.setMonth(start.getMonth() - 1);
    const end = new Date(card.cycleStart); end.setDate(end.getDate() - 1);
    return d >= start && d <= end;
  }
  if (range === "3m") {
    const cutoff = new Date(today); cutoff.setMonth(cutoff.getMonth() - 3);
    return d >= cutoff;
  }
  if (range === "6m") {
    const cutoff = new Date(today); cutoff.setMonth(cutoff.getMonth() - 6);
    return d >= cutoff;
  }
  if (range === "ytd") return d >= new Date("2026-01-01");
  return true;
}

export default function CardsScreen({ onOpenTxn }) {
  const d = DATA;
  const creditCards = d.accounts.filter(a => a.kind === "credit");
  const [activeId, setActiveId] = useState(creditCards[0].id);
  const [showNumber, setShowNumber] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const [range, setRange] = useState("cycle");

  const card = creditCards.find(c => c.id === activeId);
  const used = Math.abs(card.balance);
  const available = card.limit - used;
  const utilization = used / card.limit;

  const cycleStart = new Date(card.cycleStart);
  const cycleEnd = new Date(card.cycleEnd);
  const today = new Date("2026-05-20");
  const cycleTotalDays = Math.round((cycleEnd - cycleStart) / 86400000);
  const daysIntoCycle = Math.max(0, Math.min(cycleTotalDays, Math.round((today - cycleStart) / 86400000)));
  const daysUntilDue = Math.round((new Date(card.due) - today) / 86400000);

  const cardTxns = useMemo(
    () => d.transactions.filter(t => t.account === card.id && inRange(t, range, card)),
    [card, range]
  );
  const charges = cardTxns.filter(t => t.amount < 0);
  const totalSpend = charges.reduce((s, t) => s + Math.abs(t.amount), 0);
  const avgTicket = charges.length ? totalSpend / charges.length : 0;
  const uniqueMerchants = new Set(charges.map(t => t.merchant)).size;
  const largest = charges.reduce((m, t) => Math.abs(t.amount) > Math.abs(m?.amount || 0) ? t : m, null);

  const byCategory = aggregate(charges, t => t.cat, t => (CAT_META[t.cat] || {}).name || t.cat);
  const byMerchant = aggregate(charges, t => t.merchant, t => t.merchant);
  const bySubcat   = aggregate(charges, t => t.sub || "Other", t => t.sub || "Other");

  const sixMo = ["Dec","Jan","Feb","Mar","Apr","May"];
  const trendSpend = card.id === "acc-card-1"
    ? [38200, 41600, 44800, 39200, 36420, used]
    : [22400, 19800, 17200, 21600, 14820, used];

  const recurring = detectRecurring(d.transactions.filter(t => t.account === card.id));
  const rangeLabel = RANGE_OPTS.find(o => o.value === range).label;

  return (
    <div className="screen">
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "4px 4px 0", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div className="h-eyebrow">Credit cards</div>
          <h1 className="h-screen" style={{ marginTop: 6 }}>Spending radiography</h1>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <RangePicker value={range} onChange={setRange} options={RANGE_OPTS} />
          <button className="btn"><Icon name="download" size={14} /> Statement</button>
          <button className="btn primary"><Icon name="plus" size={14} /> Pay card</button>
        </div>
      </div>

      <div className="grid cols-12">
        <div className="span-5">
          <div className="cardstack">
            {creditCards.map(c => (
              <CreditCardViz key={c.id}
                card={c}
                active={c.id === activeId}
                showNumber={c.id === activeId && showNumber}
                frozen={c.id === activeId && frozen}
                onClick={() => setActiveId(c.id)}
              />
            ))}
          </div>
          <div className="card" style={{ marginTop: 14, padding: 8 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4 }}>
              <CardCtrl icon="pin" label={frozen ? "Frozen" : "Freeze"} active={frozen} onClick={() => setFrozen(f => !f)} />
              <CardCtrl icon="card" label={showNumber ? "Hide" : "Show"} onClick={() => setShowNumber(s => !s)} />
              <CardCtrl icon="bell" label="Alerts" />
              <CardCtrl icon="cog" label="Limits" />
            </div>
          </div>
        </div>

        <div className="span-7" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card thick>
            <div style={{ padding: "20px 22px 0", display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div>
                <div className="h-eyebrow">{card.brand} · {card.tier}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 10 }}>
                  <div className="mono" style={{ fontSize: 38, fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1 }}>
                    {fmt(used)}
                  </div>
                  <span className="muted mono" style={{ fontSize: 13 }}>of {fmt(card.limit, { compact: true })}</span>
                </div>
                <div style={{ display: "flex", gap: 14, marginTop: 14, alignItems: "center" }}>
                  <Delta value={card.delta30} />
                  <span className="muted" style={{ fontSize: 12 }}>· {fmt(available, { compact: true })} available</span>
                </div>
              </div>
              <UtilizationRing value={utilization} />
            </div>
            <div style={{ padding: "20px 22px", marginTop: 8, borderTop: "1px solid var(--line-1)", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
              <SubStat label="Statement" value={fmt(card.statementBalance, { compact: true })} mono />
              <SubStat label="Minimum" value={fmt(card.minPayment, { compact: true })} mono />
              <SubStat label="Due" value={`${fmtDate(card.due)}`} hint={`in ${daysUntilDue} days`} mono />
              <SubStat label="APR" value={fmtPct(card.apr, { dec: 1 })} mono />
            </div>
          </Card>

          <Card>
            <div className="cardhead">
              <div>
                <div className="h-eyebrow">Billing cycle</div>
                <div className="h-card" style={{ marginTop: 6 }}>
                  {fmtDate(card.cycleStart)} → {fmtDate(card.cycleEnd)}
                </div>
              </div>
              <span className="muted mono" style={{ fontSize: 11 }}>{daysIntoCycle}/{cycleTotalDays} days</span>
            </div>
            <div className="cardbody">
              <CycleBar daysIntoCycle={daysIntoCycle} cycleTotalDays={cycleTotalDays} dueDate={card.due} cycleEnd={card.cycleEnd} />
            </div>
          </Card>
        </div>
      </div>

      <div className="grid cols-4">
        <KPITile label={`Total spend · ${rangeLabel}`} value={fmt(totalSpend)} mono sub={`${charges.length} charges`} />
        <KPITile label="Avg ticket" value={fmt(avgTicket, { compact: true })} mono
                 sub={largest ? `Largest ${fmt(Math.abs(largest.amount), { compact: true })} · ${largest.merchant}` : ""} />
        <KPITile label="Unique merchants" value={uniqueMerchants.toString()} mono sub={`${byCategory.length} categories`} />
        <KPITile label={card.rewards.kind === "miles" ? "Miles earned" : "Cashback earned"}
                 value={card.rewards.kind === "miles" ? card.rewards.balance.toLocaleString() : fmt(card.rewards.balance, { compact: true })}
                 mono accent sub={`+${card.rewards.monthly.toLocaleString()} this month`} />
      </div>

      <div className="grid cols-12">
        <div className="span-8">
          <Card>
            <div className="cardhead">
              <div>
                <div className="h-eyebrow">Spending trend</div>
                <div className="h-card" style={{ marginTop: 6 }}>Balance over last 6 months</div>
              </div>
            </div>
            <div className="cardbody">
              <AreaChart labels={sixMo} series={[{ name: "Balance", data: trendSpend, primary: true }]} height={200} />
            </div>
          </Card>
        </div>
        <div className="span-4">
          <Card>
            <div className="cardhead">
              <div>
                <div className="h-eyebrow">Recurring on this card</div>
                <div className="h-card" style={{ marginTop: 6 }}>{recurring.length} detected</div>
              </div>
            </div>
            <div className="cardbody" style={{ paddingTop: 4 }}>
              {recurring.length === 0 && <div className="muted" style={{ fontSize: 12 }}>No recurring charges detected.</div>}
              {recurring.map((r, i) => (
                <div key={r.merchant} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderTop: i ? "1px solid var(--line-1)" : "0" }}>
                  <div className="merch" style={{ width: 28, height: 28, fontSize: 10 }}>{(CAT_META[r.cat] || {}).glyph}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 500 }}>{r.merchant}</div>
                    <div className="muted" style={{ fontSize: 10.5, marginTop: 2 }}>{r.cadence} · {r.count}×</div>
                  </div>
                  <div className="mono tnum" style={{ fontSize: 12 }}>{fmt(r.avg, { compact: true })}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="grid cols-12">
        <div className="span-4">
          <Card>
            <div className="cardhead">
              <div>
                <div className="h-eyebrow">By category</div>
                <div className="h-card" style={{ marginTop: 6 }}>{rangeLabel}</div>
              </div>
            </div>
            <div className="cardbody" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              {byCategory.length > 0
                ? <Donut data={byCategory.map(c => ({ label: c.label, value: c.value }))} size={160} thickness={18} />
                : <div className="muted" style={{ fontSize: 12, padding: 20 }}>No data for this range.</div>}
              <div style={{ width: "100%" }}>
                {byCategory.slice(0, 6).map((c, i) => {
                  const t = 0.95 - (i / Math.max(1, byCategory.length - 1)) * 0.65;
                  const base = i % 2 === 0 ? "var(--accent)" : "var(--text-1)";
                  return (
                    <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderTop: i ? "1px solid var(--line-1)" : "0" }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: `color-mix(in oklab, ${base} ${(t * 100).toFixed(0)}%, transparent)` }} />
                      <span style={{ fontSize: 12.5 }}>{c.label}</span>
                      <span className="mono" style={{ marginLeft: "auto", fontSize: 12 }}>{fmt(c.value, { compact: true })}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
        <div className="span-4">
          <Card>
            <div className="cardhead">
              <div>
                <div className="h-eyebrow">Top merchants</div>
                <div className="h-card" style={{ marginTop: 6 }}>Most spent · {rangeLabel}</div>
              </div>
            </div>
            <div className="cardbody" style={{ paddingTop: 8 }}>
              {byMerchant.length > 0
                ? <TopBarList items={byMerchant.map(m => ({ label: m.label, value: m.value, count: m.count, avg: m.value / m.count, secondary: m.lastDate }))} limit={8} />
                : <div className="muted" style={{ fontSize: 12 }}>No charges in this range.</div>}
            </div>
          </Card>
        </div>
        <div className="span-4">
          <Card>
            <div className="cardhead">
              <div>
                <div className="h-eyebrow">By subcategory</div>
                <div className="h-card" style={{ marginTop: 6 }}>Drill-down · {rangeLabel}</div>
              </div>
            </div>
            <div className="cardbody" style={{ paddingTop: 8 }}>
              {bySubcat.length > 0
                ? <TopBarList items={bySubcat.map(s => ({ label: s.label, value: s.value, count: s.count, secondary: s.parentCat }))} limit={8} />
                : <div className="muted" style={{ fontSize: 12 }}>No data.</div>}
            </div>
          </Card>
        </div>
      </div>

      <Card padding={false}>
        <div className="cardhead" style={{ paddingBottom: 12 }}>
          <div>
            <div className="h-eyebrow">Transaction detail · {card.number}</div>
            <div className="h-card" style={{ marginTop: 6 }}>{cardTxns.length} items · {rangeLabel}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn ghost"><Icon name="filter" size={14} /> Filter</button>
            <button className="btn ghost"><Icon name="download" size={14} /> Export</button>
          </div>
        </div>
        <div style={{ overflowX: "auto", borderTop: "1px solid var(--line-1)" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Date</th>
                <th>Merchant</th>
                <th>Category</th>
                <th>Subcategory</th>
                <th>Note</th>
                <th className="num">Amount</th>
              </tr>
            </thead>
            <tbody>
              {cardTxns.length === 0 && (
                <tr><td colSpan={6} style={{ padding: 30, textAlign: "center", color: "var(--text-3)" }}>No transactions in this range.</td></tr>
              )}
              {cardTxns.map(t => (
                <tr key={t.id} onClick={() => onOpenTxn(t)}>
                  <td className="mono muted" style={{ fontSize: 12, whiteSpace: "nowrap" }}>{fmtDate(t.date)}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="merch" style={{ width: 28, height: 28, fontSize: 10 }}>{(CAT_META[t.cat] || {}).glyph}</div>
                      <span style={{ fontWeight: 500 }}>{t.merchant}</span>
                    </div>
                  </td>
                  <td><span className="tag">{(CAT_META[t.cat] || {}).name}</span></td>
                  <td className="muted" style={{ fontSize: 12 }}>{t.sub || "—"}</td>
                  <td className="muted" style={{ fontSize: 12, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.note}</td>
                  <td className="num tnum" style={{ fontWeight: 500 }}>{t.amount > 0 ? "+" : ""}{fmt(t.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function detectRecurring(txns) {
  const byMerchant = {};
  for (const t of txns) {
    if (t.amount >= 0) continue;
    (byMerchant[t.merchant] = byMerchant[t.merchant] || []).push(t);
  }
  const recur = [];
  for (const [merchant, list] of Object.entries(byMerchant)) {
    if (list.length < 2) continue;
    list.sort((a, b) => a.date.localeCompare(b.date));
    const gaps = [];
    for (let i = 1; i < list.length; i++) {
      gaps.push((new Date(list[i].date) - new Date(list[i - 1].date)) / 86400000);
    }
    const avgGap = gaps.reduce((s, g) => s + g, 0) / gaps.length;
    const cadence = avgGap < 14 ? "Weekly" : avgGap < 45 ? "Monthly" : "Occasional";
    if (cadence === "Monthly" || merchant === "Spotify Premium" || merchant === "Netflix" || merchant === "Claro") {
      recur.push({
        merchant, cat: list[0].cat, count: list.length, cadence: cadence === "Occasional" ? "Monthly" : cadence,
        avg: list.reduce((s, t) => s + Math.abs(t.amount), 0) / list.length,
      });
    }
  }
  return recur.sort((a, b) => b.avg - a.avg);
}

function CreditCardViz({ card, active, showNumber, frozen, onClick }) {
  return (
    <div className={`cardviz ${card.style} ${active ? "active" : ""}`} onClick={onClick}>
      <div className="holo"></div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.16em", opacity: 0.55, textTransform: "uppercase" }}>{card.brand}</div>
          <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: "0.02em", marginTop: 4 }}>{card.tier}</div>
        </div>
        {frozen ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 999, background: "rgba(255,255,255,0.12)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            <span style={{ width: 6, height: 6, borderRadius: 50, background: "#fff", display: "inline-block" }} />
            Frozen
          </div>
        ) : (
          <button className="chip" aria-label="chip" onClick={(e) => e.stopPropagation()} />
        )}
      </div>
      <div>
        <div className="number">
          {showNumber ? card.fullNumber : <><span>•••• •••• ••••</span> {card.number.replace("•• ", "")}</>}
        </div>
        <div className="meta" style={{ marginTop: 14 }}>
          <div>
            <div className="lbl">Cardholder</div>
            <div className="name">{card.holder}</div>
          </div>
          <div>
            <div className="lbl">Expires</div>
            <div className="val">{card.expiry}</div>
          </div>
          <div className="network">{card.network}</div>
        </div>
      </div>
    </div>
  );
}

function UtilizationRing({ value, size = 96 }) {
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.min(1, value));
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line-1)" strokeWidth="6" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--accent)" strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={c} strokeDashoffset={offset}
                style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <div className="mono accent" style={{ fontSize: 18, fontWeight: 500 }}>{(value * 100).toFixed(0)}%</div>
        <div style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)", marginTop: 2 }}>used</div>
      </div>
    </div>
  );
}

function CycleBar({ daysIntoCycle, cycleTotalDays, dueDate, cycleEnd }) {
  const due = new Date(dueDate);
  const todayDate = new Date("2026-05-20");
  const start = new Date(todayDate); start.setTime(todayDate.getTime() - daysIntoCycle * 86400000);
  const end = new Date(cycleEnd);
  const totalSpan = Math.max(1, (due - start) / 86400000);
  const todayPct = daysIntoCycle / totalSpan;
  const cycleEndPct = (end - start) / 86400000 / totalSpan;
  return (
    <div>
      <div style={{ position: "relative", height: 36, marginTop: 6 }}>
        <div style={{ position: "absolute", top: 14, left: 0, right: 0, height: 6, borderRadius: 3, background: "var(--line-1)" }} />
        <div style={{ position: "absolute", top: 14, left: 0, width: `${todayPct * 100}%`, height: 6, borderRadius: 3, background: "var(--accent)" }} />
        <div style={{ position: "absolute", top: 8, left: `calc(${cycleEndPct * 100}% - 1px)`, width: 2, height: 18, background: "var(--text-2)" }} />
        <div style={{ position: "absolute", top: 28, left: `${cycleEndPct * 100}%`, transform: "translateX(-50%)", fontSize: 10, color: "var(--text-3)", whiteSpace: "nowrap" }}>Cycle ends</div>
        <div style={{ position: "absolute", top: 8, right: 0, width: 2, height: 18, background: "var(--accent)" }} />
        <div style={{ position: "absolute", top: 28, right: 0, fontSize: 10, color: "var(--accent-strong)", whiteSpace: "nowrap" }}>Payment due</div>
        <div style={{ position: "absolute", top: 10, left: `${todayPct * 100}%`, transform: "translateX(-50%)", width: 12, height: 12, borderRadius: 50, background: "var(--accent)", boxShadow: "0 0 0 3px var(--bg-0)" }} />
      </div>
    </div>
  );
}

function SubStat({ label, value, hint, mono }) {
  return (
    <div>
      <div className="h-eyebrow">{label}</div>
      <div className={mono ? "mono" : ""} style={{ fontSize: 18, fontWeight: 500, marginTop: 6, letterSpacing: "-0.015em" }}>{value}</div>
      {hint && <div className="muted" style={{ fontSize: 10.5, marginTop: 3 }}>{hint}</div>}
    </div>
  );
}

function KPITile({ label, value, sub, mono, accent }) {
  return (
    <Card>
      <div className="h-eyebrow">{label}</div>
      <div className={`${mono ? "mono" : ""} ${accent ? "accent" : ""}`}
           style={{ fontSize: 24, fontWeight: 500, letterSpacing: "-0.02em", marginTop: 10 }}>
        {value}
      </div>
      {sub && <div className="muted" style={{ fontSize: 11, marginTop: 6 }}>{sub}</div>}
    </Card>
  );
}

function CardCtrl({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
        padding: "12px 6px", borderRadius: 8,
        background: active ? "var(--accent-soft)" : "transparent",
        color: active ? "var(--accent-strong)" : "var(--text-1)",
        border: active ? "1px solid var(--accent-line)" : "1px solid transparent",
        transition: "background 0.15s, color 0.15s",
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--line-1)"; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}>
      <Icon name={icon} size={16} />
      <span style={{ fontSize: 11, fontWeight: 500 }}>{label}</span>
    </button>
  );
}
