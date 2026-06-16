// Mortgage payoff / extra-payment calculator. Pure core (computePayoff) exported for tests; DOM wiring guarded.
const $ = (id) => (typeof document !== "undefined" ? document.getElementById(id) : null);
const num = (v) => { const x = parseFloat(v); return Number.isFinite(x) ? x : 0; };

// amortize a loan at monthly rate i with fixed monthly payment `pay`; return {months, interest}
function amortize(loan, i, pay, capMonths) {
  let bal = loan, months = 0, interest = 0;
  while (bal > 0.005 && months < capMonths) {
    const intM = bal * i;
    let principal = pay - intM;
    if (principal <= 0) return { months: Infinity, interest: Infinity }; // payment never covers interest
    if (principal > bal) principal = bal;
    interest += intM;
    bal -= principal;
    months++;
  }
  return { months, interest };
}

export function computePayoff(loan, ratePct, years, extra) {
  loan = num(loan); const i = num(ratePct) / 100 / 12; const n = num(years) * 12; extra = num(extra);
  if (loan <= 0 || n <= 0) return null;
  const basePay = i > 0 ? loan * i / (1 - Math.pow(1 + i, -n)) : loan / n;
  const base = amortize(loan, i, basePay, n + 12);
  const withExtra = amortize(loan, i, basePay + extra, n * 2 + 24);
  const payoffMonths = withExtra.months;
  return {
    monthlyPayment: basePay,
    newMonthlyPayment: basePay + extra,
    baseMonths: base.months,
    baseInterest: base.interest,
    newMonths: payoffMonths,
    newInterest: withExtra.interest,
    monthsSaved: base.months - payoffMonths,
    interestSaved: base.interest - withExtra.interest,
  };
}

if (typeof document !== "undefined") {
  const FIELDS = ["loan", "rate", "years", "extra"];
  const money = (x) => "$" + Math.round(x).toLocaleString();
  const yrs = (m) => { if (!Number.isFinite(m)) return "—"; const y = Math.floor(m / 12), mo = m % 12; return (y ? y + " yr " : "") + (mo ? mo + " mo" : (y ? "" : "0 mo")); };
  const recompute = () => {
    const r = computePayoff($("loan").value, $("rate").value, $("years").value, $("extra").value);
    if (!r) return;
    $("o-payment").textContent = money(r.monthlyPayment) + "/mo";
    $("o-newpay").textContent = money(r.newMonthlyPayment) + "/mo";
    $("o-saved-int").textContent = money(r.interestSaved);
    $("o-saved-time").textContent = yrs(r.monthsSaved);
    $("o-payoff").textContent = yrs(r.newMonths);
    $("o-base-int").textContent = money(r.baseInterest);
    $("o-new-int").textContent = money(r.newInterest);
  };
  for (const f of FIELDS) { const el = $(f); if (el) el.addEventListener("input", recompute); }
  recompute();
}
