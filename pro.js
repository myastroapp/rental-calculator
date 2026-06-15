// Pro unlock for the rental calculator's full report. Honor-system client-side (v1).
const PRO_CODE = "RC-PRO-3X7M-9K2P";
export function isPro() { try { return localStorage.getItem("rc_pro") === "1"; } catch { return false; } }
export function setPro() { try { localStorage.setItem("rc_pro", "1"); } catch { /* ignore */ } }
export function tryUnlock(code) {
  if ((code || "").trim().toUpperCase() === PRO_CODE) { setPro(); return true; }
  return false;
}
