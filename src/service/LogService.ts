import * as winston from 'winston'
import { format } from 'winston'
import * as expressWinston from 'express-winston'
import config from '../config'
import { LOG_LEVEL, NODE_ENV_TYPE } from '../models/const'

const CODE = 'XX99FF'
const LOG_PATH = config.logPath
const { combine, timestamp, label, printf, colorize } = format
const IS_TEST_MODE = process.env.NODE_ENV === NODE_ENV_TYPE.TEST

let logLevel: LOG_LEVEL

if (config.debug) {
  logLevel = LOG_LEVEL.DEBUG
} else {
  logLevel = LOG_LEVEL.INFO
}

const myFormat = printf(info => {
  return `${new Date(info.timestamp).toLocaleDateString('zh')} [${info.label}] ${info.level}: ${info.message}`
})

const TRANSPORT_ERROR = new (winston.transports.File)({
  filename: LOG_PATH + 'bob.crm.error.log',
  format: winston.format.json(),
  handleExceptions: true,
  level: 'error',
})

const WINSTON_CONFIG: winston.LoggerOptions = {
  format: combine(
    label({ label: process.env.NODE_APP_INSTANCE }),
    colorize(),
    timestamp(),
    myFormat,
  ),
  transports: [
    new (winston.transports.Console)({
      level: logLevel,
      format: winston.format.simple(),
      silent: IS_TEST_MODE,
    }),
    new (winston.transports.File)({
      filename: LOG_PATH + 'bob.crm.info.log',
      format: winston.format.json(),
      level: 'info',
      silent: IS_TEST_MODE,
    }),
    TRANSPORT_ERROR,
    new (winston.transports.File)({
      filename: LOG_PATH + 'bob.crm.warn.log',
      format: winston.format.json(),
      level: 'warn',
    }),
  ],
  exceptionHandlers: [TRANSPORT_ERROR],
  exitOnError: false,
}

export default class LogService {
  private static _winstonLogger: winston.Logger
  private static _logger: LogService

  constructor(c: string) {
    if (c !== CODE) {
      throw Error('Please use Logger.getLogger instead of invoking the constructor.')
    }
    LogService._winstonLogger = winston.createLogger(WINSTON_CONFIG)
  }

  public static getLogger(): LogService {
    if (this._logger === undefined) {
      this._logger = new LogService(CODE)
    }
    return LogService._logger
  }

  public static getExpressErrorLogger() {
    return expressWinston.errorLogger({
      winstonInstance: this._winstonLogger,
    })
  }

  public static getExpressLogger() {
    return expressWinston.logger({
      winstonInstance: this._winstonLogger,
      meta: false,
      msg: `HTTP {{process.env.NODE_APP_INSTANCE}} {{new Date().toLocaleDateString('zh')}} {{new Date().toLocaleTimeString('zh')}} {{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.user && req.user.id}} {{req.user && req.user.entityType}} {{req.url}} {{JSON.stringify(req.body) !== '{}' ? ' POST=' + JSON.stringify(req.body) : ''}}`,
      colorize: true,
    })
  }

  public debug(...args: any[]) {
    return this.loggerMethod.call(undefined, 'debug', args)
  }

  public info(...args: any[]) {
    return this.loggerMethod.call(undefined, 'info', args)
  }

  public warn(...args: any[]) {
    return this.loggerMethod.call(undefined, 'warn', args)
  }

  public error(...args: any[]) {
    return this.loggerMethod.call(undefined, 'error', args)
  }

  private loggerMethod(methodName: 'debug' | 'info' | 'warn' | 'error', argList: any) {
    const args = [].slice.call(argList, 0)
    const logger = LogService._winstonLogger
    return logger[methodName].apply(undefined, args)
  }

}