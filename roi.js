// ROI (return on investment) calculator. Pure core exported for tests; DOM wiring guarded.
const $ = (id) => (typeof document !== "undefined" ? document.getElementById(id) : null);
const num = (v) => { const x = parseFloat(v); return Number.isFinite(x) ? x : 0; };

export function computeROI(cost, finalValue, years) {
  cost = num(cost); finalValue = num(finalValue); years = num(years);
  if (cost === 0) return null;
  const gain = finalValue - cost;
  const roi = (gain / cost) * 100;
  let annualized = null;
  if (years > 0 && finalValue > 0 && cost > 0) annualized = (Math.pow(finalValue / cost, 1 / years) - 1) * 100;
  return { gain, roi, annualized };
}

if (typeof document !== "undefined") {
  const money = (x) => (x < 0 ? "-$" : "$") + Math.abs(Math.round(x)).toLocaleString();
  const pct = (x) => (x >= 0 ? "+" : "") + x.toFixed(1) + "%";
  const recompute = () => {
    const r = computeROI($("cost").value, $("final").value, $("years").value);
    if (!r) { $("o-roi").textContent = "—"; $("o-gain").textContent = "—"; $("o-annual").textContent = "—"; return; }
    $("o-roi").textContent = pct(r.roi);
    $("o-roi").style.color = r.roi >= 0 ? "var(--accent)" : "var(--bad)";
    $("o-gain").textContent = money(r.gain);
    $("o-annual").textContent = r.annualized === null ? "—" : pct(r.annualized);
  };
  for (const f of ["cost", "final", "years"]) { const el = $(f); if (el) el.addEventListener("input", recompute); }
  recompute();
}
