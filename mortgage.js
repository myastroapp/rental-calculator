import { amortization } from "./finance.js";

const $ = (id) => document.getElementById(id);
const money = (n) => "$" + Math.round(n).toLocaleString();
const FIELDS = ["price", "downPct", "rate", "years"];

function run() {
  const price = parseFloat($("price").value) || 0;
  const downPct = parseFloat($("downPct").value) || 0;
  const rate = parseFloat($("rate").value) || 0;
  const years = parseFloat($("years").value) || 30;
  const loan = Math.max(0, price * (1 - downPct / 100));
  const { monthlyPayment, rows } = amortization(loan, rate, years);
  const totalPaid = monthlyPayment * years * 12;
  const totalInterest = Math.max(0, totalPaid - loan);

  $("o-pay").textContent = money(monthlyPayment);
  $("o-loan").textContent = money(loan);
  $("o-int").textContent = money(totalInterest);
  $("o-total").textContent = money(totalPaid);

  $("sched").innerHTML =
    `<table><thead><tr><th>Year</th><th>Principal</th><th>Interest</th><th>Balance</th></tr></thead><tbody>` +
    rows.map((r) => `<tr><td>${r.year}</td><td>${money(r.principal)}</td><td>${money(r.interest)}</td><td>${money(r.balance)}</td></tr>`).join("") +
    `</tbody></table>`;
}

if ($("price")) {
  for (const f of FIELDS) $(f).addEventListener("input", run);
  run();
}
