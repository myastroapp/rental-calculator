import { computeDeal, amortization } from "./finance.js";
import { isPro, tryUnlock } from "./pro.js";

const BUY_URL = "https://buy.stripe.com/eVq14pgrv93Y3ffcb3bwk0a";
const $ = (id) => document.getElementById(id);
const FIELDS = ["price", "downPct", "closingCosts", "rehab", "rate", "years", "monthlyRent",
  "vacancyPct", "propertyTax", "insurance", "maintPct", "mgmtPct", "hoaMonthly", "otherMonthly"];

const money = (n) => (n < 0 ? "-$" : "$") + Math.abs(Math.round(n)).toLocaleString();
const pct = (n) => n.toFixed(2) + "%";
const inputs = () => Object.fromEntries(FIELDS.map((f) => [f, $(f).value]));
let pendingPrint = false;

function setV(id, val, good) {
  const el = $(id);
  el.textContent = val;
  el.classList.remove("good", "bad");
  if (good === true) el.classList.add("good");
  if (good === false) el.classList.add("bad");
}

function recompute() {
  const i = inputs();
  const d = computeDeal(i);
  setV("o-mcf", money(d.monthlyCashFlow), d.monthlyCashFlow >= 0);
  setV("o-coc", pct(d.cashOnCash), d.cashOnCash >= 0);
  setV("o-cap", pct(d.capRate));
  setV("o-noi", money(d.noi));
  setV("o-pi", money(d.monthlyPI));
  setV("o-inv", money(d.totalInvested));
  if ($("report").dataset.shown === "1") renderReport(i);
}

function renderReport(i) {
  const d = computeDeal(i);
  const am = amortization(d.loan, parseFloat(i.rate) || 0, parseFloat(i.years) || 30);
  const price = parseFloat(i.price) || 0;
  const g = 0.03;
  let rows5 = "";
  for (let y = 1; y <= 5; y++) {
    const f = Math.pow(1 + g, y - 1);
    const dy = computeDeal({
      ...i,
      monthlyRent: (parseFloat(i.monthlyRent) || 0) * f,
      propertyTax: (parseFloat(i.propertyTax) || 0) * f,
      insurance: (parseFloat(i.insurance) || 0) * f,
      otherMonthly: (parseFloat(i.otherMonthly) || 0) * f,
      hoaMonthly: (parseFloat(i.hoaMonthly) || 0) * f,
    });
    const bal = am.rows[y - 1] ? am.rows[y - 1].balance : 0;
    const value = price * Math.pow(1 + g, y);
    rows5 += `<tr><td>${y}</td><td>${money(dy.annualCashFlow)}</td><td>${money(value - bal)}</td><td>${money(bal)}</td></tr>`;
  }
  let amRows = "";
  for (const r of am.rows) amRows += `<tr><td>${r.year}</td><td>${money(r.principal)}</td><td>${money(r.interest)}</td><td>${money(r.balance)}</td></tr>`;
  const metric = (k, v) => `<div class="m"><div class="k">${k}</div><div class="v">${v}</div></div>`;
  $("report").innerHTML =
    `<div class="rep-head"><h2>Rental Property Deal Analysis</h2>` +
    `<div class="sub">Purchase ${money(price)} · ${i.downPct || 0}% down · ${i.rate || 0}% / ${i.years || 30}yr · rent ${money(parseFloat(i.monthlyRent) || 0)}/mo</div></div>` +
    `<div class="rep-metrics">` +
      metric("Monthly cash flow", money(d.monthlyCashFlow)) +
      metric("Cash-on-cash", pct(d.cashOnCash)) +
      metric("Cap rate", pct(d.capRate)) +
      metric("NOI (annual)", money(d.noi)) +
      metric("Mortgage P&amp;I/mo", money(d.monthlyPI)) +
      metric("Cash invested", money(d.totalInvested)) +
    `</div>` +
    `<h4>5-year projection <span class="small">(assumes 3% rent/expense growth &amp; 3% appreciation)</span></h4>` +
    `<table><thead><tr><th>Year</th><th>Cash flow</th><th>Equity</th><th>Loan balance</th></tr></thead><tbody>${rows5}</tbody></table>` +
    `<h4>Amortization (yearly)</h4>` +
    `<table><thead><tr><th>Year</th><th>Principal</th><th>Interest</th><th>Balance</th></tr></thead><tbody>${amRows}</tbody></table>`;
  $("report").dataset.shown = "1";
}

const openUnlock = () => ($("unlock").hidden = false);
const closeUnlock = () => ($("unlock").hidden = true);

function wire() {
  for (const f of FIELDS) $(f).addEventListener("input", recompute);
  for (const fl of document.querySelectorAll(".field")) {
    const lab = fl.querySelector("label"), inp = fl.querySelector("input[id]");
    if (lab && inp) lab.htmlFor = inp.id;
  }
  $("buy").href = BUY_URL;
  $("btn-report").addEventListener("click", () => {
    if (!isPro()) { openUnlock(); return; }
    renderReport(inputs());
  });
  $("btn-pdf").addEventListener("click", () => {
    if (!isPro()) { pendingPrint = true; openUnlock(); return; }
    renderReport(inputs());
    window.print();
  });
  $("btn-code").addEventListener("click", () => {
    if (tryUnlock($("code").value)) {
      closeUnlock();
      renderReport(inputs());
      if (pendingPrint) { pendingPrint = false; window.print(); }
    } else { $("code").value = ""; $("code").placeholder = "Invalid code — check your receipt"; }
  });
  $("unlock-close").addEventListener("click", closeUnlock);
  $("unlock").addEventListener("click", (e) => { if (e.target.id === "unlock") closeUnlock(); });
  recompute();
}
wire();
