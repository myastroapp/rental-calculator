// Loan / auto-loan calculator. Pure core (computeLoan) exported for tests; DOM wiring guarded.
const $ = (id) => (typeof document !== "undefined" ? document.getElementById(id) : null);
const num = (v) => { const x = parseFloat(v); return Number.isFinite(x) ? x : 0; };

export function computeLoan(amount, ratePct, years) {
  amount = num(amount); const i = num(ratePct) / 100 / 12; const n = Math.round(num(years) * 12);
  if (amount <= 0 || n <= 0) return null;
  const payment = i > 0 ? amount * i / (1 - Math.pow(1 + i, -n)) : amount / n;
  const totalPaid = payment * n;
  return { payment, months: n, totalPaid, totalInterest: totalPaid - amount, principal: amount };
}

if (typeof document !== "undefined") {
  const FIELDS = ["amount", "rate", "years"];
  const money = (x) => "$" + Math.round(x).toLocaleString();
  const money2 = (x) => "$" + x.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const recompute = () => {
    const r = computeLoan($("amount").value, $("rate").value, $("years").value);
    if (!r) { return; }
    $("o-payment").textContent = money2(r.payment) + "/mo";
    $("o-interest").textContent = money(r.totalInterest);
    $("o-total").textContent = money(r.totalPaid);
    $("o-principal").textContent = money(r.principal);
    $("o-months").textContent = r.months + " payments";
  };
  for (const f of FIELDS) { const el = $(f); if (el) el.addEventListener("input", recompute); }
  recompute();
}
