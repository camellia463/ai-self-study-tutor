/**
 * 请求追踪 + 耗时监控中间件
 * - 每个请求生成唯一 requestId
 * - 写入响应头 X-Request-Id
 * - 记录请求方法、路径、状态码、耗时
 */
const crypto = require('crypto')
const { makeLogger } = require('../utils/logger')
const log = makeLogger('http')

function requestTracker(req, res, next) {
  const start = Date.now()
  const reqId = req.headers['x-request-id'] || crypto.randomBytes(8).toString('hex')
  req.requestId = reqId
  res.setHeader('X-Request-Id', reqId)

  res.on('finish', () => {
    const dur = Date.now() - start
    log.info(`${req.method} ${req.path} → ${res.statusCode}`, {
      reqId, ms: dur, ip: req.ip || '-'
    })
  })
  next()
}

module.exports = { requestTracker }
