/* Investments screen */

function InvestmentsScreen({ onOpenHolding, range, setRange }) {
  const d = window.DATA;

  const stockValue = d.stocks.reduce((s, h) => s + h.qty * h.price, 0);
  const stockCost  = d.stocks.reduce((s, h) => s + h.qty * h.cost, 0);
  const stockGain = stockValue - stockCost;
  const stockROI = stockGain / stockCost;

  const altValue = d.alts.reduce((s, a) => s + a.value, 0);
  const total = stockValue + altValue;

  // Allocation breakdown
  const alloc = [
    { label: "Equities", value: stockValue },
    { label: "Real Estate", value: d.alts.filter(a => a.kind === "Real Estate").reduce((s, a) => s + a.value, 0) },
    { label: "Fixed Income", value: d.alts.filter(a => a.kind === "Bond" || a.kind === "CD").reduce((s, a) => s + a.value, 0) },
    { label: "Crypto", value: d.alts.filter(a => a.kind === "Crypto").reduce((s, a) => s + a.value, 0) },
  ].filter(a => a.value > 0);

  // Build performance series for portfolio
  const portfolioSeries = d.netWorth.map((v, i) => Math.round(v * 0.42 + (i * 1200)));
  const benchmarkSeries = d.netWorth.map((v, i) => Math.round(v * 0.38 + (i * 900)));

  const ranges = ["1M", "3M", "6M", "1Y", "ALL"];

  return (
    <div className="screen">
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "4px 4px 0", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div className="h-eyebrow">Portfolio</div>
          <h1 className="h-screen" style={{ marginTop: 6 }}>Investments</h1>
        </div>
        <div className="segmented">
          {ranges.map(r => (
            <button key={r} className={range === r ? "active" : ""} onClick={() => setRange(r)}>{r}</button>
          ))}
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid cols-4">
        <Card>
          <div className="h-eyebrow">Total portfolio</div>
          <div className="metric-xl mono" style={{ marginTop: 12 }}>{fmt(total, { compact: true })}</div>
          <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="muted" style={{ fontSize: 11 }}>{d.stocks.length} stocks · {d.alts.length} alternatives</span>
            <Delta value={0.038} />
          </div>
        </Card>
        <Card>
          <div className="h-eyebrow">Equities</div>
          <div className="metric-xl mono" style={{ marginTop: 12 }}>{fmt(stockValue, { compact: true })}</div>
          <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="muted" style={{ fontSize: 11 }}>{fmtPct(stockValue / total, { dec: 1 })} of total</span>
            <Delta value={stockROI} />
          </div>
        </Card>
        <Card>
          <div className="h-eyebrow">Unrealized P&amp;L</div>
          <div className="metric-xl mono" style={{ marginTop: 12 }}>+{fmt(stockGain, { compact: true })}</div>
          <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="muted" style={{ fontSize: 11 }}>vs. cost basis {fmt(stockCost, { compact: true })}</span>
            <Delta value={stockROI} />
          </div>
        </Card>
        <Card>
          <div className="h-eyebrow">Alternatives</div>
          <div className="metric-xl mono" style={{ marginTop: 12 }}>{fmt(altValue, { compact: true })}</div>
          <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="muted" style={{ fontSize: 11 }}>CDs, bonds, crypto, real estate</span>
            <Delta value={0.018} />
          </div>
        </Card>
      </div>

      {/* Performance chart + allocation */}
      <div className="grid cols-12">
        <div className="span-8">
          <Card>
            <div className="cardhead">
              <div>
                <div className="h-eyebrow">Performance</div>
                <div className="h-card" style={{ marginTop: 6 }}>Portfolio vs. benchmark · 12 months</div>
              </div>
              <div style={{ display: "flex", gap: 14, fontSize: 11, color: "var(--text-2)" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 18, height: 2, background: "var(--text-0)" }} /> Portfolio
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 18, height: 2, background: "var(--text-3)" }} /> Benchmark (S&amp;P)
                </span>
              </div>
            </div>
            <div className="cardbody">
              <AreaChart
                labels={d.months}
                series={[
                  { name: "Portfolio", data: portfolioSeries, primary: true },
                  { name: "Benchmark", data: benchmarkSeries, dashed: true },
                ]}
                height={240}
              />
            </div>
          </Card>
        </div>
        <div className="span-4">
          <Card>
            <div className="cardhead">
              <div>
                <div className="h-eyebrow">Allocation</div>
                <div className="h-card" style={{ marginTop: 6 }}>By asset class</div>
              </div>
            </div>
            <div className="cardbody" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <Donut data={alloc} size={170} thickness={20} />
              <div style={{ width: "100%" }}>
                {alloc.map((a, i) => {
                  const t = 0.95 - (i / Math.max(1, alloc.length - 1)) * 0.65;
                  const base = i % 2 === 0 ? "var(--accent)" : "var(--text-1)";
                  return (
                    <div key={a.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderTop: i ? "1px solid var(--line-1)" : "0" }}>
                      <span style={{ width: 9, height: 9, borderRadius: 2, background: `color-mix(in oklab, ${base} ${(t*100).toFixed(0)}%, transparent)` }} />
                      <span style={{ fontSize: 12.5 }}>{a.label}</span>
                      <span className="muted mono" style={{ marginLeft: "auto", fontSize: 11 }}>{fmtPct(a.value / total, { dec: 1 })}</span>
                      <span className="mono" style={{ fontSize: 12.5, minWidth: 78, textAlign: "right" }}>{fmt(a.value, { compact: true })}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Holdings table */}
      <Card padding={false}>
        <div className="cardhead" style={{ paddingBottom: 12 }}>
          <div>
            <div className="h-eyebrow">Holdings</div>
            <div className="h-card" style={{ marginTop: 6 }}>Stock portfolio · {d.stocks.length} positions</div>
          </div>
          <button className="btn ghost"><Icon name="plus" size={14} /> Add position</button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Ticker / Company</th>
                <th>Trend · 30D</th>
                <th className="num">Qty</th>
                <th className="num">Last</th>
                <th className="num">Day</th>
                <th className="num">Market value</th>
                <th className="num">Cost basis</th>
                <th className="num">Gain / Loss</th>
                <th className="num">Weight</th>
              </tr>
            </thead>
            <tbody>
              {d.stocks.map(s => {
                const mv = s.qty * s.price;
                const cb = s.qty * s.cost;
                const gain = mv - cb;
                const roi = gain / cb;
                return (
                  <tr key={s.ticker} onClick={() => onOpenHolding(s)}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className="merch" style={{ width: 30, height: 30, fontWeight: 600 }}>{s.ticker.slice(0, 1)}</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "var(--font-mono)" }}>{s.ticker}</div>
                          <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{s.name}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: "var(--text-1)", width: 110 }}>
                      <Sparkline data={s.series} width={96} height={28} />
                    </td>
                    <td className="num tnum">{s.qty}</td>
                    <td className="num tnum">${s.price.toFixed(2)}</td>
                    <td className="num"><Delta value={s.day} /></td>
                    <td className="num tnum" style={{ fontWeight: 500 }}>{fmt(mv * 36.4, { compact: true })}</td>
                    <td className="num tnum muted">{fmt(cb * 36.4, { compact: true })}</td>
                    <td className="num">
                      <div className="mono tnum" style={{ fontWeight: 500 }}>{gain >= 0 ? "+" : ""}{fmt(gain * 36.4, { compact: true })}</div>
                      <Delta value={roi} />
                    </td>
                    <td className="num">
                      <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
                        <div style={{ width: 36, height: 3, background: "var(--line-1)", borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ width: `${s.weight * 100}%`, height: "100%", background: "var(--text-0)" }} />
                        </div>
                        <span className="mono tnum" style={{ fontSize: 11.5 }}>{fmtPct(s.weight, { dec: 0 })}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Alternatives */}
      <Card>
        <div className="cardhead">
          <div>
            <div className="h-eyebrow">Alternative investments</div>
            <div className="h-card" style={{ marginTop: 6 }}>CDs, bonds, crypto &amp; real estate</div>
          </div>
          <button className="btn ghost"><Icon name="plus" size={14} /> Document asset</button>
        </div>
        <div className="cardbody">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
            {d.alts.map((a, i) => (
              <div key={i} style={{ padding: 14, border: "1px solid var(--line-1)", borderRadius: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="tag">{a.kind}</span>
                  {a.rate != null && <span className="muted mono" style={{ fontSize: 11 }}>{fmtPct(a.rate, { dec: 1 })}</span>}
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 500, marginTop: 10 }}>{a.name}</div>
                <div className="mono" style={{ fontSize: 19, marginTop: 6, letterSpacing: "-0.02em" }}>
                  {fmt(a.value, { compact: true })}
                </div>
                <div className="muted" style={{ fontSize: 11, marginTop: 6 }}>
                  {a.matures ? `Matures ${fmtDate(a.matures)}` : a.qty != null ? `Holding ${a.qty}` : a.note}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

window.InvestmentsScreen = InvestmentsScreen;
