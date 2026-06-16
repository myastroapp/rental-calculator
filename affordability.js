// House affordability (28/36 DTI rule). Pure core (affordability) exported for tests; DOM wiring guarded.
const $ = (id) => (typeof document !== "undefined" ? document.getElementById(id) : null);
const num = (v) => { const x = parseFloat(v); return Number.isFinite(x) ? x : 0; };

export function affordability(i) {
  const grossMonthly = num(i.income) / 12;
  const front = num(i.frontDti) / 100;       // % of gross for housing (PITI+HOA)
  const back = num(i.backDti) / 100;         // % of gross for all debt
  const maxByFront = grossMonthly * front;
  const maxByBack = grossMonthly * back - num(i.monthlyDebts);
  const maxHousing = Math.max(0, Math.min(maxByFront, maxByBack));
  const limitedBy = maxByBack < maxByFront ? "back-end (total-debt) ratio" : "front-end (housing) ratio";

  const rate = num(i.rate) / 100 / 12;       // monthly rate
  const n = num(i.years) * 12;
  // monthly payment factor k: payment = loan * k
  const k = rate > 0 ? rate / (1 - Math.pow(1 + rate, -n)) : (n > 0 ? 1 / n : 0);

  const down = num(i.down);
  const taxMonthlyRate = num(i.taxRate) / 100 / 12;   // of home value
  const insMonthly = num(i.insuranceAnnual) / 12;
  const hoa = num(i.hoaMonthly);

  // loan*k + (loan+down)*taxMonthlyRate + insMonthly + hoa = maxHousing
  const denom = k + taxMonthlyRate;
  const budgetForLoan = maxHousing - down * taxMonthlyRate - insMonthly - hoa;
  let maxLoan = denom > 0 ? budgetForLoan / denom : 0;
  if (!Number.isFinite(maxLoan) || maxLoan < 0) maxLoan = 0;

  const maxPrice = maxLoan + down;
  const pi = maxLoan * k;
  const tax = maxPrice * taxMonthlyRate;
  const piti = pi + tax + insMonthly + hoa;

  return {
    maxPrice, maxLoan, maxHousing,
    limitedBy: maxLoan === 0 ? "fixed costs exceed budget" : limitedBy,
    breakdown: { pi, tax, insurance: insMonthly, hoa, total: piti },
  };
}

if (typeof document !== "undefined") {
  const FIELDS = ["income", "monthlyDebts", "down", "rate", "years", "taxRate", "insuranceAnnual", "hoaMonthly", "frontDti", "backDti"];
  const money = (x) => "$" + Math.round(x).toLocaleString();
  const recompute = () => {
    const i = Object.fromEntries(FIELDS.map((f) => [f, $(f).value]));
    const r = affordability(i);
    $("o-price").textContent = money(r.maxPrice);
    $("o-loan").textContent = money(r.maxLoan);
    $("o-payment").textContent = money(r.breakdown.total) + "/mo";
    $("o-limited").textContent = r.limitedBy;
    $("o-pi").textContent = money(r.breakdown.pi);
    $("o-tax").textContent = money(r.breakdown.tax);
    $("o-ins").textContent = money(r.breakdown.insurance);
    $("o-hoa").textContent = money(r.breakdown.hoa);
  };
  for (const f of FIELDS) { const el = $(f); if (el) el.addEventListener("input", recompute); }
  recompute();
}
