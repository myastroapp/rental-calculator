// Savings goal calculator — required monthly contribution to hit a target. Pure core exported for tests.
const $ = (id) => (typeof document !== "undefined" ? document.getElementById(id) : null);
const num = (v) => { const x = parseFloat(v); return Number.isFinite(x) ? x : 0; };

export function savingsGoal(target, years, annualReturnPct, current) {
  target = num(target); current = num(current);
  const r = num(annualReturnPct) / 100 / 12;
  const n = Math.round(num(years) * 12);
  if (n <= 0) return null;
  const fvCurrent = current * Math.pow(1 + r, n);
  const remaining = target - fvCurrent;
  if (remaining <= 0) {
    return { monthly: 0, months: n, onTrack: true, fvCurrent, totalContributed: 0, interest: fvCurrent - current };
  }
  const factor = r > 0 ? (Math.pow(1 + r, n) - 1) / r : n; // future value of $1/mo annuity
  const monthly = remaining / factor;
  const totalContributed = monthly * n;
  const endValue = fvCurrent + monthly * factor; // ≈ target
  return { monthly, months: n, onTrack: false, fvCurrent, totalContributed, interest: endValue - current - totalContributed };
}

if (typeof document !== "undefined") {
  const money = (x) => "$" + Math.round(x).toLocaleString();
  const money2 = (x) => "$" + x.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const recompute = () => {
    const r = savingsGoal($("target").value, $("years").value, $("return").value, $("current").value);
    if (!r) return;
    if (r.onTrack) {
      $("o-monthly").textContent = "$0 — on track!";
      $("o-note").textContent = "Your current savings alone grow past the goal.";
    } else {
      $("o-monthly").textContent = money2(r.monthly) + "/mo";
      $("o-note").textContent = "";
    }
    $("o-contributed").textContent = money(r.totalContributed + num($("current").value));
    $("o-interest").textContent = money(r.interest);
  };
  for (const f of ["target", "years", "return", "current"]) { const el = $(f); if (el) el.addEventListener("input", recompute); }
  recompute();
}
