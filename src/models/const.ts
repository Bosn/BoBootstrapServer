
export { ACCESS_TYPE, EMPLOYEE_NORMAL_ACCESS_TYPE_LIST, ROLE_TYPE, ROLE_TYPE_LIST, MAP_ROLE_TYPE_TO_ACCESS_TYPE_LIST } from './sharedConsts/access'

export enum SYS_EVENT_TYPE {
  DB_CONNECTED = 'dbConnected',
  DB_SYNC_FINISHED = 'dbSyncFinished',
}

export enum NODE_ENV_TYPE {
  /** test mode */
  TEST = 'test',
  /** production mode */
  PROD = 'production',
  /** development mode */
  DEV = 'development',
}
export enum SCOPE_TYPE {
  SUMMARY = 'SUMMARY',
}

export enum ENTITY_TYPE {
  CUSTOMER = 1,
  EMPLOYEE = 2,
  COMPANY = 9,
  COMPANY_WE_CHAT = 11,
  SESSION = 12,
}

export enum STATE_TYPE {
  ENABLED = 1,
  DISABLED = -1,
}

export enum NOTIFICATION_TYPE {
  COMMENT_REPLY = 1,
  POST_REPLY = 2,
}

export enum NOTIFY_STATE {
  INITED = 0,
  NOTIFIED = 1,
  FINISHED = 2,
  CLEARED = 3,
}

export const RES_NO_ACESS = { isOk: false, errMsg: 'You have no right to access this data. 您无权访问该数据。' }

export enum DATE_CONST {
  SECOND = 1000,
  MINUTE = 1000 * 60,
  HOUR = 1000 * 60 * 60,
  DAY = 1000 * 60 * 60 * 24,
  MONTH = 1000 * 60 * 60 * 24 * 30,
  YEAR = 1000 * 60 * 60 * 24 * 365,
}

enum COMMON_ERR_MSG {
  OP_FAIL = '因未知错误操作失败，请联系软件技术支持。',
  ACCESS_FORBIDDEN = '您没有访问该页面或数据的权限！',
  ERROR_PARAMS = '参数错误',
  NEED_LOGIN = '该请求需要登陆，请登陆后重试。',
}

export enum COMMON_TEMPLATE {
  ACCESS_FORBIDDEN = 'common/accessForbidden',
}

export const COMMON_ERR_RES = {
  OP_FAIL: { isOk: false, errMsg: COMMON_ERR_MSG.OP_FAIL, code: 'OP_FAIL' },
  ACCESS_FORBIDDEN: { isOk: false, errMsg: COMMON_ERR_MSG.ACCESS_FORBIDDEN, title: '没有权限', code: 'ACCESS_FORBIDDEN' },
  ERROR_PARAMS: { isOk: false, errMsg: COMMON_ERR_MSG.ERROR_PARAMS, code: 'ERROR_PARAMS' },
  NEED_LOGIN: { isOk: false, errMsg: COMMON_ERR_MSG.NEED_LOGIN, code: 'NEED_LOGIN' },
}

export enum COMMON_ERR_RES_CODE {
  OP_FAIL = 'OP_FAIL',
  ACCESS_FORBIDDEN = 'ACCESS_FORBIDDEN',
  ERROR_PARAMS = 'ERROR_PARAMS',
  NEED_LOGIN = 'NEED_LOGIN',
}

export enum SEX_TYPE {
  FEMALE = 0,
  MALE = 1,
}
export enum LOG_LEVEL {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export const DEFAULT_PAGER_LIMIT = 10
export const DEFAULT_PAGER_OFFSET = 0

export const RESERVE_PASSWORD = '**reserve**'