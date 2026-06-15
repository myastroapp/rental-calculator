// Compound interest with optional monthly contributions (monthly compounding).
const $ = (id) => (typeof document !== "undefined" ? document.getElementById(id) : null);
const money = (n) => "$" + Math.round(n).toLocaleString();
const FIELDS = ["principal", "monthly", "rate", "years"];

export function project(principal, monthly, ratePct, years) {
  const r = (ratePct / 100) / 12;
  const t = Math.round(years * 12);
  const fvPrincipal = principal * Math.pow(1 + r, t);
  const fvContrib = r === 0 ? monthly * t : monthly * ((Math.pow(1 + r, t) - 1) / r);
  const fv = fvPrincipal + fvContrib;
  const contributed = principal + monthly * t;
  return { fv, contributed, interest: fv - contributed };
}

function run() {
  const { fv, contributed, interest } = project(
    +$("principal").value || 0, +$("monthly").value || 0,
    +$("rate").value || 0, +$("years").value || 0,
  );
  $("o-fv").textContent = money(fv);
  $("o-contrib").textContent = money(contributed);
  $("o-int").textContent = money(interest);
}

if ($("principal")) {
  for (const f of FIELDS) $(f).addEventListener("input", run);
  run();
}
