import { useState, useEffect } from 'react';
import { DATA } from './data.js';
import { fmt, fmtDate, fmtDateLong } from './utils.js';
import { Icon, Card, Delta, Sparkline, CAT_META } from './components.jsx';
import { TweaksPanel, TweakSection, TweakRadio } from './TweaksPanel.jsx';
import OverviewScreen from './screens/OverviewScreen.jsx';
import AccountsScreen from './screens/AccountsScreen.jsx';
import CardsScreen from './screens/CardsScreen.jsx';
import InvestmentsScreen from './screens/InvestmentsScreen.jsx';

const TWEAK_DEFAULTS = {
  cardStyle: "glass",
  theme: "dark",
};

export default function App() {
  const [tab, setTab] = useState("overview");
  const [range, setRange] = useState("6M");
  const [tweaks, setTweaksState] = useState(TWEAK_DEFAULTS);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", tweaks.theme);
    document.documentElement.setAttribute("data-cardstyle", tweaks.cardStyle);
  }, [tweaks.theme, tweaks.cardStyle]);

  const setTweak = (k, v) => {
    const next = typeof k === "object" ? { ...tweaks, ...k } : { ...tweaks, [k]: v };
    setTweaksState(next);
    window.parent.postMessage({ type: "__edit_mode_set_keys", edits: typeof k === "object" ? k : { [k]: v } }, "*");
  };

  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("all");
  const [drawer, setDrawer] = useState(null);
  const [modal, setModal] = useState(null);
  const [acctSwitchOpen, setAcctSwitchOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") { setDrawer(null); setModal(null); setAcctSwitchOpen(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openTxn = (t) => setDrawer({ kind: "txn", data: t });
  const openHolding = (h) => setDrawer({ kind: "holding", data: h });
  const openAccount = (a) => setDrawer({ kind: "account", data: a });
  const openAdd = () => setModal({ kind: "add" });

  const navItems = [
    { id: "overview",     label: "Overview",      icon: "home" },
    { id: "accounts",     label: "Accounts",      icon: "wallet", count: DATA.transactions.length },
    { id: "cards",        label: "Credit Cards",  icon: "card",   count: DATA.accounts.filter(a => a.kind === "credit").length },
    { id: "investments",  label: "Investments",   icon: "chart" },
  ];

  const crumb = {
    overview:    ["Dashboard", "Overview"],
    accounts:    ["Money", "Accounts"],
    cards:       ["Money", "Credit cards"],
    investments: ["Wealth", "Investments"],
  }[tab];

  return (
    <>
      <div className="ambient"><span></span></div>
      <div className="grain"></div>

      <div className="app">
        <aside className="card sidebar">
          <div className="brand">
            <div className="mark">G</div>
            <div>
              <div className="name">Genesis</div>
              <div className="sub">Personal Finance</div>
            </div>
          </div>

          <div className="navsection">Workspace</div>
          {navItems.map(n => (
            <div key={n.id} className={`navitem ${tab === n.id ? "active" : ""}`} onClick={() => setTab(n.id)}>
              <Icon name={n.icon} size={15} />
              {n.label}
              {n.count != null && <span className="count">{n.count}</span>}
            </div>
          ))}

          <div className="navsection">Tools</div>
          <div className="navitem"><Icon name="insight" size={15} /> Insights</div>
          <div className="navitem"><Icon name="bell" size={15} /> Notifications <span className="count">3</span></div>
          <div className="navitem"><Icon name="cog" size={15} /> Settings</div>

          <div className="acctswitch" onClick={() => setAcctSwitchOpen(o => !o)}>
            <div className="avatar">AM</div>
            <div>
              <div className="who">Andrea Martínez</div>
              <div className="role">Personal · NIO</div>
            </div>
            <Icon name="chev" size={14} className="chev" />
            {acctSwitchOpen && <AccountDropdown onClose={() => setAcctSwitchOpen(false)} />}
          </div>
        </aside>

        <header className="topbar">
          <div className="crumb">
            <span style={{ opacity: 0.6 }}>{crumb[0]}</span>
            <span style={{ margin: "0 8px", color: "var(--text-3)" }}>/</span>
            <b>{crumb[1]}</b>
          </div>
          <div className="search">
            <Icon name="search" size={14} />
            <input value={search}
                   onChange={e => { setSearch(e.target.value); if (e.target.value && tab !== "accounts") setTab("accounts"); }}
                   placeholder="Search transactions, merchants, holdings…" />
            <span className="mono" style={{ fontSize: 10, color: "var(--text-3)", border: "1px solid var(--line-2)", padding: "1px 5px", borderRadius: 4 }}>⌘K</span>
          </div>
          <div className="right">
            <button className="iconbtn" title={tweaks.theme === "dark" ? "Switch to light" : "Switch to dark"}
                    onClick={() => setTweak("theme", tweaks.theme === "dark" ? "light" : "dark")}>
              <Icon name={tweaks.theme === "dark" ? "sun" : "moon"} size={15} />
            </button>
            <button className="iconbtn"><Icon name="bell" size={15} /></button>
            <button className="btn primary" onClick={openAdd}><Icon name="plus" size={13} /> New</button>
          </div>
        </header>

        <main className="main">
          {tab === "overview" && (
            <OverviewScreen onOpenTxn={openTxn} onAddTxn={openAdd}
                            range={range} setRange={setRange}
                            openAccount={openAccount} />
          )}
          {tab === "accounts" && (
            <AccountsScreen onOpenTxn={openTxn} onAddTxn={openAdd}
                            search={search} setSearch={setSearch}
                            activeCat={activeCat} setActiveCat={setActiveCat} />
          )}
          {tab === "cards" && <CardsScreen onOpenTxn={openTxn} />}
          {tab === "investments" && (
            <InvestmentsScreen onOpenHolding={openHolding} range={range} setRange={setRange} />
          )}
        </main>

        <nav className="mobilenav">
          <div className="card">
            {navItems.map(n => (
              <div key={n.id} className={`navitem ${tab === n.id ? "active" : ""}`} onClick={() => setTab(n.id)}>
                <Icon name={n.icon} size={15} />
                <span style={{ fontSize: 12 }}>{n.label}</span>
              </div>
            ))}
          </div>
        </nav>
      </div>

      {drawer && (
        <>
          <div className="scrim" onClick={() => setDrawer(null)}></div>
          <Drawer drawer={drawer} onClose={() => setDrawer(null)} />
        </>
      )}

      {modal && (
        <>
          <div className="scrim" onClick={() => setModal(null)}></div>
          {modal.kind === "add" && <AddTxnModal onClose={() => setModal(null)} />}
        </>
      )}

      <TweaksPanel title="Tweaks">
        <TweakSection label="Appearance">
          <TweakRadio label="Theme" value={tweaks.theme}
                      options={[{ value: "dark", label: "Dark" }, { value: "light", label: "Light" }]}
                      onChange={v => setTweak("theme", v)} />
          <TweakRadio label="Card style" value={tweaks.cardStyle}
                      options={[
                        { value: "glass",   label: "Glass" },
                        { value: "solid",   label: "Solid" },
                        { value: "outline", label: "Outline" },
                      ]}
                      onChange={v => setTweak("cardStyle", v)} />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

/* ============ Drawer ============ */
function Drawer({ drawer, onClose }) {
  if (drawer.kind === "txn")     return <TxnDrawer     t={drawer.data} onClose={onClose} />;
  if (drawer.kind === "holding") return <HoldingDrawer h={drawer.data} onClose={onClose} />;
  if (drawer.kind === "account") return <AccountDrawer a={drawer.data} onClose={onClose} />;
  return null;
}

function TxnDrawer({ t, onClose }) {
  const d = DATA;
  const acc = d.accounts.find(a => a.id === t.account);
  const cat = CAT_META[t.cat] || {};
  return (
    <div className="drawer">
      <div className="drawer-head">
        <Icon name="wallet" size={15} />
        <h3>Transaction detail</h3>
        <button className="iconbtn" style={{ marginLeft: "auto" }} onClick={onClose}><Icon name="close" size={14} /></button>
      </div>
      <div className="drawer-body">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div className="merch" style={{ width: 56, height: 56, borderRadius: 14, fontSize: 17 }}>{cat.glyph}</div>
          <div style={{ minWidth: 0 }}>
            <div className="muted" style={{ fontSize: 11 }}>{fmtDateLong(t.date)}</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>{t.merchant}</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{cat.name} · {t.method}</div>
          </div>
        </div>

        <div style={{ marginTop: 20, padding: "16px 0", borderTop: "1px solid var(--line-1)", borderBottom: "1px solid var(--line-1)" }}>
          <div className="muted" style={{ fontSize: 11 }}>Amount</div>
          <div className="mono" style={{ fontSize: 32, fontWeight: 500, letterSpacing: "-0.025em", marginTop: 6 }}>
            {t.amount > 0 ? "+" : ""}{fmt(t.amount)}
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <DRow label="Account" value={acc ? acc.name : t.account} />
          <DRow label="Method" value={t.method} />
          <DRow label="Category" value={<span className="tag">{cat.name}</span>} />
          {t.note && <DRow label="Note" value={t.note} />}
          <DRow label="Transaction ID" value={<span className="mono">{t.id.toUpperCase()}</span>} />
          <DRow label="Status" value={<span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span className="dot" /> Posted</span>} />
        </div>

        <div style={{ marginTop: 20 }}>
          <div className="h-eyebrow" style={{ marginBottom: 10 }}>Similar transactions</div>
          {d.transactions.filter(x => x.cat === t.cat && x.id !== t.id).slice(0, 3).map(x => (
            <div key={x.id} className="row" style={{ borderBottom: "1px solid var(--line-1)", padding: "10px 0" }}>
              <div className="merch" style={{ width: 28, height: 28, fontSize: 10 }}>{(CAT_META[x.cat] || {}).glyph}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{x.merchant}</div>
                <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{fmtDate(x.date)}</div>
              </div>
              <div className="mono tnum" style={{ fontSize: 12.5 }}>{x.amount > 0 ? "+" : ""}{fmt(x.amount)}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20, display: "flex", gap: 8 }}>
          <button className="btn" style={{ flex: 1 }}><Icon name="pin" size={13} /> Save</button>
          <button className="btn" style={{ flex: 1 }}><Icon name="filter" size={13} /> Recategorize</button>
        </div>
      </div>
    </div>
  );
}

function HoldingDrawer({ h, onClose }) {
  const mv = h.qty * h.price * 36.4;
  const cb = h.qty * h.cost * 36.4;
  const gain = mv - cb;
  return (
    <div className="drawer">
      <div className="drawer-head">
        <Icon name="grow" size={15} />
        <h3>{h.ticker} · holding</h3>
        <button className="iconbtn" style={{ marginLeft: "auto" }} onClick={onClose}><Icon name="close" size={14} /></button>
      </div>
      <div className="drawer-body">
        <div className="muted" style={{ fontSize: 11 }}>{h.name}</div>
        <div className="mono" style={{ fontSize: 32, fontWeight: 500, marginTop: 6, letterSpacing: "-0.025em" }}>${h.price.toFixed(2)}</div>
        <div style={{ marginTop: 6 }}><Delta value={h.day} /> today</div>

        <div style={{ marginTop: 18, color: "var(--text-1)" }}>
          <Sparkline data={h.series} width={380} height={80} stroke={1.6} />
        </div>

        <div style={{ marginTop: 18 }}>
          <DRow label="Quantity" value={<span className="mono">{h.qty} shares</span>} />
          <DRow label="Market value" value={<span className="mono">{fmt(mv)}</span>} />
          <DRow label="Cost basis" value={<span className="mono">{fmt(cb)}</span>} />
          <DRow label="Unrealized P&L" value={
            <span className="mono">{gain >= 0 ? "+" : ""}{fmt(gain)} · {fmtPct((mv - cb) / cb, { sign: true })}</span>
          } />
          <DRow label="Portfolio weight" value={fmtPct(h.weight, { dec: 0 })} />
        </div>

        <div style={{ marginTop: 20, display: "flex", gap: 8 }}>
          <button className="btn primary" style={{ flex: 1 }}><Icon name="arrow" size={13} /> Trade</button>
          <button className="btn" style={{ flex: 1 }}><Icon name="bell" size={13} /> Set alert</button>
        </div>
      </div>
    </div>
  );
}

function fmtPct(n, opts = {}) {
  const dec = opts.dec != null ? opts.dec : 1;
  const sign = (opts.sign && n > 0) ? "+" : "";
  return sign + (n * 100).toFixed(dec) + "%";
}

function AccountDrawer({ a, onClose }) {
  const d = DATA;
  const txns = d.transactions.filter(t => t.account === a.id).slice(0, 8);
  return (
    <div className="drawer">
      <div className="drawer-head">
        <Icon name={a.kind === "credit" ? "card" : a.kind === "investment" ? "grow" : "wallet"} size={15} />
        <h3>{a.name}</h3>
        <button className="iconbtn" style={{ marginLeft: "auto" }} onClick={onClose}><Icon name="close" size={14} /></button>
      </div>
      <div className="drawer-body">
        <div className="muted mono" style={{ fontSize: 12 }}>{a.number}</div>
        <div className="mono" style={{ fontSize: 32, fontWeight: 500, marginTop: 6, letterSpacing: "-0.025em" }}>
          {a.balance < 0 ? "-" : ""}{fmt(Math.abs(a.balance))}
        </div>
        <div style={{ marginTop: 6 }}><Delta value={a.delta30} /> last 30 days</div>

        <div style={{ marginTop: 18 }}>
          {a.kind === "credit" && <>
            <DRow label="Credit limit" value={<span className="mono">{fmt(a.limit)}</span>} />
            <DRow label="Available" value={<span className="mono">{fmt(a.limit - Math.abs(a.balance))}</span>} />
            <DRow label="Payment due" value={fmtDateLong(a.due)} />
          </>}
          {a.kind === "savings" && <DRow label="APR" value={fmtPct(a.apr, { dec: 2 })} />}
          <DRow label="Account type" value={a.kind.charAt(0).toUpperCase() + a.kind.slice(1)} />
        </div>

        <div style={{ marginTop: 18 }}>
          <div className="h-eyebrow" style={{ marginBottom: 10 }}>Recent activity</div>
          {txns.map(t => (
            <div key={t.id} className="row" style={{ borderBottom: "1px solid var(--line-1)", padding: "10px 0" }}>
              <div className="merch" style={{ width: 28, height: 28, fontSize: 10 }}>{(CAT_META[t.cat] || {}).glyph}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.merchant}</div>
                <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{fmtDate(t.date)}</div>
              </div>
              <div className="mono tnum" style={{ fontSize: 12.5 }}>{t.amount > 0 ? "+" : ""}{fmt(t.amount)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--line-1)" }}>
      <span className="muted" style={{ fontSize: 12 }}>{label}</span>
      <span style={{ fontSize: 13 }}>{value}</span>
    </div>
  );
}

/* ============ Add transaction modal ============ */
function AddTxnModal({ onClose }) {
  const d = DATA;
  const [form, setForm] = useState({
    amount: "",
    merchant: "",
    account: d.accounts[0].id,
    category: d.categories[0].id,
    note: "",
    type: "debit",
  });
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="modal">
      <div className="modal-head">
        <Icon name="plus" size={15} />
        <h3>Add transaction</h3>
        <button className="iconbtn" style={{ marginLeft: "auto" }} onClick={onClose}><Icon name="close" size={14} /></button>
      </div>
      <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="segmented" style={{ alignSelf: "flex-start" }}>
          <button className={form.type === "debit" ? "active" : ""} onClick={() => upd("type", "debit")}>Expense</button>
          <button className={form.type === "credit" ? "active" : ""} onClick={() => upd("type", "credit")}>Income</button>
          <button className={form.type === "transfer" ? "active" : ""} onClick={() => upd("type", "transfer")}>Transfer</button>
        </div>

        <div className="field">
          <label>Amount</label>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="muted mono" style={{ fontSize: 18 }}>C$</span>
            <input type="text" inputMode="decimal" value={form.amount}
                   onChange={e => upd("amount", e.target.value.replace(/[^0-9.,]/g, ""))}
                   placeholder="0.00"
                   style={{ flex: 1, fontSize: 22, fontFamily: "var(--font-mono)", letterSpacing: "-0.02em" }} />
          </div>
        </div>

        <div className="field">
          <label>Merchant / Payee</label>
          <input type="text" value={form.merchant} onChange={e => upd("merchant", e.target.value)} placeholder="e.g. La Colonia" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="field">
            <label>Account</label>
            <select value={form.account} onChange={e => upd("account", e.target.value)}>
              {d.accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Category</label>
            <select value={form.category} onChange={e => upd("category", e.target.value)}>
              {d.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="field">
          <label>Note (optional)</label>
          <input type="text" value={form.note} onChange={e => upd("note", e.target.value)} placeholder="Add a note…" />
        </div>
      </div>
      <div className="modal-foot">
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn primary" onClick={onClose}>Save transaction</button>
      </div>
    </div>
  );
}

/* ============ Account switcher dropdown ============ */
function AccountDropdown({ onClose }) {
  return (
    <div style={{ position: "absolute", bottom: "calc(100% + 6px)", left: 0, right: 0,
                  background: "var(--bg-1)", border: "1px solid var(--line-2)",
                  borderRadius: 12, padding: 6, zIndex: 10,
                  boxShadow: "0 16px 40px -16px rgba(0,0,0,0.5)" }}
         onClick={e => e.stopPropagation()}>
      {[
        { name: "Andrea Martínez", role: "Personal · NIO", active: true, av: "AM" },
        { name: "Martínez Family",  role: "Joint household", av: "MF" },
        { name: "Consultoría AM",   role: "Business · NIO", av: "CA" },
      ].map(p => (
        <div key={p.name} className="navitem" onClick={onClose} style={{ gap: 10, padding: 8 }}>
          <div className="avatar" style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg, var(--text-1), var(--text-3))", color: "var(--bg-0)", fontSize: 10, fontWeight: 600, display: "grid", placeItems: "center" }}>{p.av}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 500 }}>{p.name}</div>
            <div className="muted" style={{ fontSize: 10.5, marginTop: 1 }}>{p.role}</div>
          </div>
          {p.active && <span className="dot" />}
        </div>
      ))}
      <div style={{ borderTop: "1px solid var(--line-1)", marginTop: 4, paddingTop: 4 }}>
        <div className="navitem" style={{ gap: 10, padding: 8 }} onClick={onClose}>
          <Icon name="plus" size={13} />
          <span style={{ fontSize: 12.5 }}>Add profile</span>
        </div>
      </div>
    </div>
  );
}
