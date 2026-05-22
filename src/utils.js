export function fmt(n, opts = {}) {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : (opts.sign ? "+" : "");
  if (opts.compact && abs >= 1000) {
    if (abs >= 1e6) return sign + "C$" + (abs / 1e6).toFixed(2) + "M";
    if (abs >= 1e3) return sign + "C$" + (abs / 1e3).toFixed(1) + "k";
  }
  const fixed = opts.dec != null ? opts.dec : 2;
  const parts = abs.toFixed(fixed).split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return sign + "C$" + parts.join(".");
}

export function fmtPct(n, opts = {}) {
  const dec = opts.dec != null ? opts.dec : 1;
  const sign = (opts.sign && n > 0) ? "+" : "";
  return sign + (n * 100).toFixed(dec) + "%";
}

export function fmtDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function fmtDateLong(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}
