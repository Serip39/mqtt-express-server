const log4js = require('log4js')
const dateFormat = require('date-format')
const chalk = require('chalk')

const LOG_LEVEL = 'ALL' // DEBUG: TRACE or DEBUG, PRODUCTION: INFO or OFF

const levelColors = {
  TRACE: { meta: 'grey', body: 'grey', trace: null },
  DEBUG: { meta: 'green', body: 'grey', trace: null },
  INFO: { meta: 'cyan', body: 'white', trace: null },
  WARN: { meta: 'yellow', body: 'yellow', trace: null },
  ERROR: { meta: 'red', body: 'red', trace: 'white' },
  FATAL: { meta: 'magenta', body: 'magenta', trace: 'white' }
}

const coloring = function(color, text) {
  if (color) {
    return chalk[color](text)
  }
  return text
}

log4js.addLayout('origin', function({ addColor }) {
  return function(e) {
    const date = new Date(e.startTime)
    const level = e.level.levelStr.toUpperCase() // 大文字
    const hasCallStack = e.hasOwnProperty('callStack') // callStack を持っているか

    const dateStr = dateFormat('yyyy-MM-dd hh:mm:ss.SSS', date)
    const message = e.data.join(' ') // データはスペース区切り
    const levelStr = level.padEnd(5).slice(0, 5) // 5文字
    const color = levelColors[level]

    // メタ情報
    const meta = `${dateStr} [${levelStr}]`
    const prefix = addColor ? coloring(color.meta, meta) : meta

    // ログ本体
    const body = addColor ? coloring(color.body, message) : message

    // スタックトレース
    let suffix = ''
    if (hasCallStack && color.trace) {
      const callStack = e.callStack
      suffix += os.EOL
      suffix += addColor ? coloring(color.trace, callStack) : callStack
    }

    return `${prefix} ${body}${suffix}`
  }
})

log4js.configure({
  appenders: {
    out: {
      type: 'stdout',
      layout: { type: 'origin', addColor: true }
    },
    logFile: {
      type: 'dateFile',
      filename: './src/logs/connection.log',
      layout: { type: 'origin', addColor: false },
      pattern: '.yyyy-MM-dd',
      alwaysIncludePattern: true,
      daysToKeep: 30,  //保存期間は30日間
      keepFileExt: true
    },
    errFile: {
      type: 'dateFile',
      filename: './src/logs/error.log',
      layout: { type: 'origin', addColor: false },
      pattern: '.yyyy-MM-dd',
      alwaysIncludePattern: true,
      daysToKeep: 30,  //保存期間は30日間
      keepFileExt: true
    },
    log: {
      type: 'logLevelFilter',
      appender: 'logFile',
      level: 'info'
    },
    err: {
      type: 'logLevelFilter',
      appender: 'errFile',
      level: 'warn'
    }
  },
  categories: {
    default: {
      appenders: ['out', 'log', 'err'],
      level: LOG_LEVEL,
      enableCallStack: true
    }
  }
})

const logger = log4js.getLogger()

function debug (str) {
  logger.debug(str)
}

function info (str) {
  logger.info(str)
}

function error (str) {
  logger.error(str)
}

module.exports = {
  debug,
  info,
  error
}
