/**
 * 结构化日志（零依赖）
 * 输出格式：时间戳 | 级别 | 模块 | 消息 [+ 字段]
 */
const COLORS = { debug: '\x1b[90m', info: '\x1b[36m', warn: '\x1b[33m', error: '\x1b[31m' }
const RESET = '\x1b[0m'

function fmt(level, module, msg, fields) {
  const ts = new Date().toISOString()
  const c = COLORS[level] || ''
  const tail = fields && Object.keys(fields).length
    ? ' ' + Object.entries(fields).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(' ')
    : ''
  return `${c}[${ts}] [${level.toUpperCase()}] [${module}] ${msg}${tail}${RESET}`
}

function makeLogger(module) {
  return {
    debug: (msg, fields) => console.log(fmt('debug', module, msg, fields)),
    info:  (msg, fields) => console.log(fmt('info',  module, msg, fields)),
    warn:  (msg, fields) => console.warn(fmt('warn', module, msg, fields)),
    error: (msg, fields) => console.error(fmt('error', module, msg, fields)),
  }
}

module.exports = { makeLogger }
