// Pure rental-property underwriting math. No DOM — unit-testable in isolation.
const num = (v) => { const x = parseFloat(v); return Number.isFinite(x) ? x : 0; };

export function computeDeal(i) {
  const price = num(i.price);
  const downPct = num(i.downPct);
  const rate = num(i.rate);
  const years = num(i.years);
  const monthlyRent = num(i.monthlyRent);
  const vacancyPct = num(i.vacancyPct);
  const propertyTaxAnnual = num(i.propertyTax);
  const insuranceAnnual = num(i.insurance);
  const maintPct = num(i.maintPct);   // % of gross rent
  const mgmtPct = num(i.mgmtPct);     // % of effective gross income
  const otherMonthly = num(i.otherMonthly);
  const hoaMonthly = num(i.hoaMonthly);
  const closingCosts = num(i.closingCosts);
  const rehab = num(i.rehab);

  const down = price * downPct / 100;
  const loan = Math.max(0, price - down);
  const r = rate / 100 / 12;
  const n = years * 12;
  const monthlyPI = loan === 0 ? 0
    : r === 0 ? loan / n
    : (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

  const grossRent = monthlyRent * 12;
  const vacancy = grossRent * vacancyPct / 100;
  const egi = grossRent - vacancy;                 // effective gross income
  const maintenance = grossRent * maintPct / 100;
  const mgmt = egi * mgmtPct / 100;
  const opex = propertyTaxAnnual + insuranceAnnual + maintenance + mgmt + otherMonthly * 12 + hoaMonthly * 12;
  const noi = egi - opex;                          // net operating income (excludes debt service)
  const annualDebtService = monthlyPI * 12;
  const annualCashFlow = noi - annualDebtService;
  const totalInvested = down + closingCosts + rehab;

  return {
    down, loan, monthlyPI,
    grossRent, vacancy, egi, opex, noi,
    annualDebtService, annualCashFlow, monthlyCashFlow: annualCashFlow / 12,
    capRate: price ? (noi / price) * 100 : 0,
    cashOnCash: totalInvested ? (annualCashFlow / totalInvested) * 100 : 0,
    dscr: annualDebtService ? noi / annualDebtService : 0,
    totalInvested,
  };
}

// 30-year amortization schedule (monthly), summarized to yearly rows.
export function amortization(loan, ratePct, years) {
  const r = ratePct / 100 / 12;
  const n = years * 12;
  const pay = loan === 0 ? 0 : r === 0 ? loan / n : (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  let balance = loan;
  const rows = [];
  let yearInterest = 0, yearPrincipal = 0;
  for (let m = 1; m <= n; m++) {
    const interest = balance * r;
    const principal = Math.min(pay - interest, balance);
    balance -= principal;
    yearInterest += interest;
    yearPrincipal += principal;
    if (m % 12 === 0 || m === n) {
      rows.push({ year: Math.ceil(m / 12), interest: yearInterest, principal: yearPrincipal, balance: Math.max(0, balance) });
      yearInterest = 0; yearPrincipal = 0;
    }
  }
  return { monthlyPayment: pay, rows };
}
