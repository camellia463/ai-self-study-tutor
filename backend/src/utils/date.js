/**
 * 本地日期工具
 * 用本地时区格式化日期，避免 toISOString() 的 UTC 偏移导致日期错一天
 */

function formatLocalDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function todayLocal() {
  return formatLocalDate(new Date());
}

module.exports = { formatLocalDate, todayLocal };
