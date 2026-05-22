import { useState } from 'react';
import { DATA } from '../data.js';
import { fmt, fmtPct, fmtDate } from '../utils.js';
import { Icon, Card, Delta, AreaChart, BarPairs, Progress, CAT_META } from '../components.jsx';

export default function OverviewScreen({ onOpenTxn, onAddTxn, range, setRange, openAccount }) {
  const d = DATA;

  const totalAssets = d.accounts.filter(a => a.balance > 0).reduce((s, a) => s + a.balance, 0);
  const totalLiab   = d.accounts.filter(a => a.balance < 0).reduce((s, a) => s + Math.abs(a.balance), 0);
  const netWorth = totalAssets - totalLiab;
  const netWorthPrev = d.netWorth[d.netWorth.length - 2];
  const netWorthDelta = (netWorth - netWorthPrev) / netWorthPrev;

  const monthIncome = d.income[d.income.length - 1];
  const monthSpend = d.spending[d.spending.length - 1];
  const cashflow = monthIncome - monthSpend;
  const cashflowPrev = d.income[d.income.length - 2] - d.spending[d.spending.length - 2];
  const cashflowDelta = (cashflow - cashflowPrev) / Math.abs(cashflowPrev);

  const recent = d.spending.slice(-4);
  const avgDaily = recent.reduce((s, v) => s + v, 0) / recent.length / 30;
  const projected = avgDaily * 31;

  const recentTxns = d.transactions.slice(0, 5);
  const catRows = d.categories.filter(c => c.thisMonth > 0).sort((a, b) => b.thisMonth - a.thisMonth);
  const labels12 = d.months;
  const ranges = ["1M", "3M", "6M", "1Y", "ALL"];

  return (
    <div className="screen">
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "4px 4px 0", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div className="h-eyebrow">Wed · May 20, 2026</div>
          <h1 className="h-screen" style={{ marginTop: 6 }}>Good afternoon, Andrea</h1>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div className="segmented">
            {ranges.map(r => (
              <button key={r} className={range === r ? "active" : ""} onClick={() => setRange(r)}>{r}</button>
            ))}
          </div>
          <button className="btn" onClick={onAddTxn}><Icon name="plus" size={14} /> Add transaction</button>
        </div>
      </div>

      <div className="grid cols-12">
        <div className="span-8">
          <Card thick>
            <div style={{ padding: "20px 22px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
              <div>
                <div className="h-eyebrow">Net worth</div>
                <div className="mono" style={{ fontSize: 44, fontWeight: 500, letterSpacing: "-0.035em", marginTop: 8, lineHeight: 1 }}>
                  {fmt(netWorth)}
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 8, alignItems: "center" }}>
                  <Delta value={netWorthDelta} />
                  <span className="muted" style={{ fontSize: 12 }}>· +{fmt(netWorth - netWorthPrev, { compact: true })} this month</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 14 }}>
                <div>
                  <div className="h-eyebrow">Assets</div>
                  <div className="mono" style={{ fontSize: 16, marginTop: 4 }}>{fmt(totalAssets, { compact: true })}</div>
                </div>
                <div style={{ width: 1, background: "var(--line-1)" }} />
                <div>
                  <div className="h-eyebrow">Liabilities</div>
                  <div className="mono" style={{ fontSize: 16, marginTop: 4 }}>-{fmt(totalLiab, { compact: true })}</div>
                </div>
              </div>
            </div>
            <div style={{ padding: "20px 12px 12px" }}>
              <AreaChart labels={labels12} series={[{ name: "Net worth", data: d.netWorth, primary: true }]} height={300} />
            </div>
          </Card>
        </div>

        <div className="span-4" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card>
            <div className="h-eyebrow">Cashflow · May</div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 12, gap: 10 }}>
              <div className="metric-lg mono accent">+{fmt(cashflow, { compact: true })}</div>
              <Delta value={cashflowDelta} />
            </div>
            <div className="muted" style={{ fontSize: 11, marginTop: 8 }}>
              Income {fmt(monthIncome, { compact: true })} · Spend {fmt(monthSpend, { compact: true })}
            </div>
            <div style={{ marginTop: 12, display: "flex", height: 6, borderRadius: 3, overflow: "hidden", background: "var(--line-1)" }}>
              <div style={{ width: `${(monthIncome / (monthIncome + monthSpend)) * 100}%`, background: "var(--accent)" }} />
              <div style={{ width: `${(monthSpend / (monthIncome + monthSpend)) * 100}%`, background: "var(--text-2)" }} />
            </div>
          </Card>
          <Card>
            <div className="h-eyebrow">Projected · End of May</div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 12, gap: 10 }}>
              <div className="metric-lg mono">{fmt(projected, { compact: true })}</div>
              <span className="mono muted" style={{ fontSize: 12 }}>{Math.round(monthSpend / projected * 100)}%</span>
            </div>
            <div style={{ marginTop: 12 }}>
              <Progress value={monthSpend} max={projected} />
            </div>
            <div className="muted" style={{ fontSize: 11, marginTop: 8 }}>11 days left · 4-mo trend</div>
          </Card>
          <Card style={{ flex: 1 }}>
            <div className="h-eyebrow">Savings rate</div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 12, gap: 10 }}>
              <div className="metric-lg mono accent">{fmtPct(cashflow / monthIncome, { dec: 0 })}</div>
              <Delta value={0.04} />
            </div>
            <div className="muted" style={{ fontSize: 11, marginTop: 8 }}>Above your 40% target</div>
          </Card>
        </div>
      </div>

      <Card>
        <div className="cardhead">
          <div>
            <div className="h-eyebrow">Cashflow</div>
            <div className="h-card" style={{ marginTop: 6 }}>Income vs. spending · 12 months</div>
          </div>
          <div style={{ display: "flex", gap: 14, alignItems: "center", fontSize: 11, color: "var(--text-2)" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 18, height: 2, background: "var(--accent)" }} /> Income
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 18, height: 2, background: "var(--text-3)", borderTop: "1px dashed var(--text-3)" }} /> Spending
            </span>
          </div>
        </div>
        <div className="cardbody">
          <AreaChart
            labels={labels12}
            series={[
              { name: "Income", data: d.income, primary: true },
              { name: "Spending", data: d.spending, dashed: true },
            ]}
            height={260}
          />
        </div>
      </Card>

      <div className="grid cols-12">
        <div className="span-8">
          <Card>
            <div className="cardhead">
              <div>
                <div className="h-eyebrow">Spending by category</div>
                <div className="h-card" style={{ marginTop: 6 }}>May vs. April</div>
              </div>
              <div style={{ display: "flex", gap: 14, alignItems: "center", fontSize: 11, color: "var(--text-2)" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 10, height: 10, background: "var(--accent)", borderRadius: 2 }} /> May
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 10, height: 10, background: "var(--line-2)", borderRadius: 2 }} /> April
                </span>
              </div>
            </div>
            <div className="cardbody">
              <BarPairs rows={catRows.map(c => ({ label: c.name, a: c.thisMonth, b: c.prevMonth }))} height={240} />
            </div>
          </Card>
        </div>
        <div className="span-4">
          <Card>
            <div className="cardhead">
              <div>
                <div className="h-eyebrow">Insights</div>
                <div className="h-card" style={{ marginTop: 6 }}>This month</div>
              </div>
              <button className="iconbtn"><Icon name="dots" size={14} /></button>
            </div>
            <div className="cardbody" style={{ paddingTop: 6 }}>
              {d.insights.map((ins, i) => (
                <div key={i} style={{ padding: "12px 0", borderTop: i ? "1px solid var(--line-1)" : "0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="dot" style={{ background: ins.tone === "up" ? "var(--accent)" : "var(--text-3)" }} />
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{ins.title}</div>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 4, lineHeight: 1.5 }}>{ins.body}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card padding={false}>
        <div className="cardhead" style={{ paddingBottom: 12 }}>
          <div>
            <div className="h-eyebrow">Recent activity</div>
            <div className="h-card" style={{ marginTop: 6 }}>Last 5 transactions</div>
          </div>
          <button className="btn ghost" style={{ fontSize: 11 }}>View all <Icon name="chevr" size={12} /></button>
        </div>
        <div style={{ borderTop: "1px solid var(--line-1)" }}>
          {recentTxns.map((t, i) => (
            <div key={t.id} onClick={() => onOpenTxn(t)}
                 style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 18px",
                          borderBottom: i < recentTxns.length - 1 ? "1px solid var(--line-1)" : "0",
                          cursor: "pointer", transition: "background 0.12s" }}
                 onMouseEnter={e => e.currentTarget.style.background = "var(--line-1)"}
                 onMouseLeave={e => e.currentTarget.style.background = ""}>
              <div className="merch">{(CAT_META[t.cat] || {}).glyph || "·"}</div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{t.merchant}</div>
                <div className="muted" style={{ fontSize: 11.5, marginTop: 3 }}>
                  {fmtDate(t.date)} · {(CAT_META[t.cat] || {}).name} · {t.method}
                </div>
              </div>
              <div className="mono tnum" style={{ fontSize: 14, fontWeight: 500 }}>
                {t.amount > 0 ? "+" : ""}{fmt(t.amount)}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="cardhead">
          <div>
            <div className="h-eyebrow">Accounts</div>
            <div className="h-card" style={{ marginTop: 6 }}>All linked accounts</div>
          </div>
          <button className="btn ghost" style={{ fontSize: 11 }}>Manage <Icon name="chevr" size={12} /></button>
        </div>
        <div className="cardbody">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
            {d.accounts.map(a => (
              <div key={a.id} onClick={() => openAccount(a)}
                   style={{ padding: 12, border: "1px solid var(--line-1)", borderRadius: 10, cursor: "pointer", transition: "background 0.15s, border-color 0.15s" }}
                   onMouseEnter={e => { e.currentTarget.style.background = "var(--line-1)"; e.currentTarget.style.borderColor = "var(--line-2)"; }}
                   onMouseLeave={e => { e.currentTarget.style.background = ""; e.currentTarget.style.borderColor = ""; }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <Icon name={a.kind === "credit" ? "card" : a.kind === "investment" ? "grow" : "wallet"} size={14} />
                  <Delta value={a.delta30} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 500, marginTop: 8 }}>{a.name}</div>
                <div className="mono" style={{ fontSize: 16, fontWeight: 500, marginTop: 4, letterSpacing: "-0.02em" }}>
                  {a.balance < 0 ? "-" : ""}{fmt(Math.abs(a.balance), { compact: true })}
                </div>
                <div className="muted mono" style={{ fontSize: 10.5, marginTop: 2 }}>{a.number}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
