import { useState, useMemo } from 'react';
import { DATA } from '../data.js';
import { fmt, fmtDateLong } from '../utils.js';
import { Icon, Card, Delta, AreaChart, Donut, TopBarList, RangePicker, aggregate, CAT_META } from '../components.jsx';

const ACC_RANGE_OPTS = [
  { value: "1m",  label: "1M" },
  { value: "3m",  label: "3M" },
  { value: "6m",  label: "6M" },
  { value: "1y",  label: "1Y" },
  { value: "ytd", label: "YTD" },
];

export default function AccountsScreen({ onOpenTxn, onAddTxn, search, setSearch, activeCat, setActiveCat }) {
  const d = DATA;
  const [activeAcct, setActiveAcct] = useState("all");
  const [range, setRange] = useState("6m");

  const months = d.months;
  const sliceLen = { "1m": 2, "3m": 4, "6m": 7, "1y": 12, "ytd": 5 }[range] || 12;
  const labels = months.slice(-sliceLen);

  const accountIds = activeAcct === "all" ? d.accounts.map(a => a.id) : [activeAcct];
  const heroSeries = labels.map((_, i) => {
    const idx = months.length - sliceLen + i;
    return accountIds.reduce((s, id) => s + (d.accountHistory[id]?.[idx] || 0), 0);
  });
  const heroEnd = heroSeries[heroSeries.length - 1];
  const heroStart = heroSeries[0];
  const heroDelta = (heroEnd - heroStart) / Math.abs(heroStart || 1);

  const today = new Date("2026-05-20");
  const rangeCutoff = new Date(today);
  rangeCutoff.setMonth(rangeCutoff.getMonth() - sliceLen);

  const filteredTxns = useMemo(() => {
    return d.transactions.filter(t => {
      if (activeAcct !== "all" && t.account !== activeAcct) return false;
      if (activeCat !== "all" && t.cat !== activeCat) return false;
      if (new Date(t.date) < rangeCutoff) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!t.merchant.toLowerCase().includes(q) && !(t.note || "").toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [activeAcct, activeCat, search, range]);

  const charges = filteredTxns.filter(t => t.amount < 0);
  const income  = filteredTxns.filter(t => t.amount > 0 && t.cat !== "transfer");
  const totalOut = charges.reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalIn  = income.reduce((s, t) => s + t.amount, 0);
  const netFlow  = totalIn - totalOut;

  const byCategory = aggregate(charges, t => t.cat, t => (CAT_META[t.cat] || {}).name || t.cat);
  const byMerchant = aggregate(charges, t => t.merchant, t => t.merchant);
  const bySubcat   = aggregate(charges, t => t.sub || "Other", t => t.sub || "Other");

  const grouped = useMemo(() => {
    const g = {};
    filteredTxns.forEach(t => { (g[t.date] = g[t.date] || []).push(t); });
    return Object.entries(g).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredTxns]);

  const cats = [{ id: "all", name: "All" }, ...d.categories.map(c => ({ id: c.id, name: c.name }))];
  const acct = activeAcct === "all" ? null : d.accounts.find(a => a.id === activeAcct);
  const rangeLabel = ACC_RANGE_OPTS.find(o => o.value === range).label;

  return (
    <div className="screen">
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "4px 4px 0", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div className="h-eyebrow">Accounts</div>
          <h1 className="h-screen" style={{ marginTop: 6 }}>Money movement</h1>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <RangePicker value={range} onChange={setRange} options={ACC_RANGE_OPTS} />
          <button className="btn primary" onClick={onAddTxn}><Icon name="plus" size={14} /> Add transaction</button>
        </div>
      </div>

      <Card thick>
        <div style={{ padding: "22px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div className="h-eyebrow">{activeAcct === "all" ? "Total balance · all accounts" : acct.name}</div>
            <div className="mono" style={{ fontSize: 44, fontWeight: 500, letterSpacing: "-0.035em", marginTop: 10, lineHeight: 1 }}>
              {heroEnd < 0 ? "-" : ""}{fmt(Math.abs(heroEnd))}
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 10, alignItems: "center" }}>
              <Delta value={heroDelta} />
              <span className="muted" style={{ fontSize: 12 }}>
                · {heroEnd > heroStart ? "+" : ""}{fmt(heroEnd - heroStart, { compact: true })} over {rangeLabel}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 14, fontSize: 11, color: "var(--text-2)" }}>
            <div>
              <div className="h-eyebrow">Money in</div>
              <div className="mono accent" style={{ fontSize: 16, marginTop: 4 }}>+{fmt(totalIn, { compact: true })}</div>
            </div>
            <div style={{ width: 1, background: "var(--line-1)" }} />
            <div>
              <div className="h-eyebrow">Money out</div>
              <div className="mono" style={{ fontSize: 16, marginTop: 4 }}>-{fmt(totalOut, { compact: true })}</div>
            </div>
            <div style={{ width: 1, background: "var(--line-1)" }} />
            <div>
              <div className="h-eyebrow">Net flow</div>
              <div className="mono" style={{ fontSize: 16, marginTop: 4 }}>{netFlow >= 0 ? "+" : "-"}{fmt(Math.abs(netFlow), { compact: true })}</div>
            </div>
          </div>
        </div>
        <div style={{ padding: "20px 12px 12px" }}>
          <AreaChart labels={labels} series={[{ name: "Balance", data: heroSeries, primary: true }]} height={260} />
        </div>
      </Card>

      <div className="card" style={{ padding: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div className="h-eyebrow">Filter by account</div>
          <span className="muted mono" style={{ fontSize: 11 }}>{activeAcct === "all" ? `${d.accounts.length} accounts` : "1 selected"}</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 8 }}>
          <AcctFilterTile
            active={activeAcct === "all"}
            onClick={() => setActiveAcct("all")}
            icon="wallet"
            label="All accounts"
            value={fmt(d.accounts.reduce((s, a) => s + a.balance, 0), { compact: true })}
            sub={`${d.accounts.length} linked`}
          />
          {d.accounts.map(a => (
            <AcctFilterTile key={a.id}
              active={activeAcct === a.id}
              onClick={() => setActiveAcct(a.id)}
              icon={a.kind === "credit" ? "card" : a.kind === "investment" ? "grow" : "wallet"}
              label={a.name}
              value={(a.balance < 0 ? "-" : "") + fmt(Math.abs(a.balance), { compact: true })}
              sub={a.number}
              delta={a.delta30}
            />
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 12, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 220, padding: "7px 12px", background: "var(--line-1)", borderRadius: 9, border: "1px solid var(--line-1)" }}>
          <Icon name="search" size={14} />
          <input value={search} onChange={e => setSearch(e.target.value)}
                 placeholder="Search merchant or note…"
                 style={{ flex: 1, background: "none", border: 0, outline: 0, fontSize: 13 }} />
          {search && <button className="iconbtn" style={{ width: 22, height: 22 }} onClick={() => setSearch("")}><Icon name="close" size={12} /></button>}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {cats.map(c => (
            <button key={c.id} className={`chip ${activeCat === c.id ? "active" : ""}`} onClick={() => setActiveCat(c.id)}>
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid cols-4">
        <KPITileAcc label={`Transactions · ${rangeLabel}`} value={filteredTxns.length.toString()} mono
                    sub={`${charges.length} debits · ${income.length} credits`} />
        <KPITileAcc label="Money in" value={"+" + fmt(totalIn, { compact: true })} mono accent
                    sub={income.length ? `${income.length} deposits` : "—"} />
        <KPITileAcc label="Money out" value={"-" + fmt(totalOut, { compact: true })} mono
                    sub={charges.length ? `${charges.length} charges` : "—"} />
        <KPITileAcc label="Net flow" value={(netFlow >= 0 ? "+" : "-") + fmt(Math.abs(netFlow), { compact: true })} mono
                    sub={charges.length ? `Avg ticket ${fmt(totalOut / charges.length, { compact: true })}` : "—"} />
      </div>

      <div className="grid cols-12">
        <div className="span-4">
          <Card>
            <div className="cardhead">
              <div>
                <div className="h-eyebrow">By category</div>
                <div className="h-card" style={{ marginTop: 6 }}>{rangeLabel}{acct ? ` · ${acct.name}` : ""}</div>
              </div>
            </div>
            <div className="cardbody" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              {byCategory.length > 0
                ? <Donut data={byCategory.map(c => ({ label: c.label, value: c.value }))} size={160} thickness={18} />
                : <div className="muted" style={{ fontSize: 12, padding: 20 }}>No data for this filter.</div>}
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
            <div className="h-eyebrow">Activity</div>
            <div className="h-card" style={{ marginTop: 6 }}>
              {filteredTxns.length} transactions{acct ? ` · ${acct.name}` : ""}
              {activeCat !== "all" ? ` · ${(d.categories.find(c => c.id === activeCat) || {}).name}` : ""}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn ghost"><Icon name="filter" size={14} /> Filter</button>
            <button className="btn ghost"><Icon name="download" size={14} /> Export</button>
          </div>
        </div>
        <div style={{ borderTop: "1px solid var(--line-1)" }}>
          {grouped.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text-3)", fontSize: 13 }}>
              No transactions match your filters.
            </div>
          )}
          {grouped.map(([date, items]) => (
            <div key={date}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                            padding: "10px 18px", background: "var(--line-1)",
                            borderTop: "1px solid var(--line-1)", borderBottom: "1px solid var(--line-1)" }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-2)" }}>
                  {fmtDateLong(date)}
                </div>
                <div className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>
                  {items.length} item{items.length > 1 ? "s" : ""} · {fmt(items.reduce((s, i) => s + i.amount, 0))}
                </div>
              </div>
              {items.map((t, i) => {
                const acc = d.accounts.find(a => a.id === t.account);
                return (
                  <div key={t.id} onClick={() => onOpenTxn(t)}
                       style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 18px",
                                borderBottom: i < items.length - 1 ? "1px solid var(--line-1)" : "0",
                                cursor: "pointer", transition: "background 0.12s" }}
                       onMouseEnter={e => e.currentTarget.style.background = "var(--line-1)"}
                       onMouseLeave={e => e.currentTarget.style.background = ""}>
                    <div className="merch">{(CAT_META[t.cat] || {}).glyph || "·"}</div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 500 }}>{t.merchant}</div>
                      <div className="muted" style={{ fontSize: 11.5, marginTop: 3, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <span>{(CAT_META[t.cat] || {}).name}</span>
                        {t.sub && <><span className="dot muted" style={{ width: 3, height: 3 }} /><span>{t.sub}</span></>}
                        <span className="dot muted" style={{ width: 3, height: 3 }} />
                        <span>{t.method}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="mono tnum" style={{ fontSize: 14, fontWeight: 500 }}>
                        {t.amount > 0 ? "+" : ""}{fmt(t.amount)}
                      </div>
                      <div className="muted mono" style={{ fontSize: 11, marginTop: 3 }}>{acc ? acc.number : ""}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function AcctFilterTile({ active, onClick, icon, label, value, sub, delta }) {
  return (
    <button onClick={onClick}
      style={{
        textAlign: "left", display: "block", width: "100%",
        padding: "10px 12px", borderRadius: 10,
        background: active ? "var(--accent-soft)" : "transparent",
        border: active ? "1px solid var(--accent-line)" : "1px solid var(--line-1)",
        transition: "all 0.15s",
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--line-1)"; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <Icon name={icon} size={13} />
        {delta != null && <Delta value={delta} />}
      </div>
      <div style={{ fontSize: 12, fontWeight: 500, marginTop: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</div>
      <div className="mono" style={{ fontSize: 16, marginTop: 4, letterSpacing: "-0.02em",
                                      color: active ? "var(--accent-strong)" : "var(--text-0)" }}>{value}</div>
      <div className="muted mono" style={{ fontSize: 10.5, marginTop: 2 }}>{sub}</div>
    </button>
  );
}

function KPITileAcc({ label, value, sub, mono, accent }) {
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
