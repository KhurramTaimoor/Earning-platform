export function ok(res, data = {}, message = 'Success') {
  return res.json({ success: true, message, ...data });
}

export function fail(res, status = 400, message = 'Something went wrong', extra = {}) {
  return res.status(status).json({ success: false, message, ...extra });
}

export function toNumber(value) {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n : 0;
}

export function startOfTodayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}
