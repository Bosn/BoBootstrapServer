import * as redis from 'redis'
import { ENTITY_TYPE, DATE_CONST } from '../models/const'
import config from '../config'

export enum CACHE_KEY {
  GT_SEARCH = 1,
  SHARED_MOTION_GROUPS_DATA = 'SHARED_MOTION_GROUPS_DATA',
  MINE_SHARED_MOTION_GROUPS_DATA = 'MINE_SHARED_MOTION_GROUPS_DATA',
  MOTIONS_DATA = 'MOTIONS_DATA',
  TAGS_DATA = 'TAGS_DATA',
  ACCESS_TOKEN = 'ACCESS_TOKEN',
  SESSION = 'SESSION',
  TRAINER_SUMMARY = 'TRAINER_SUMMARY',
  SALARY_REPORTS = 'SALARY_REPORTS',
  GUIDE_KEY = 'GUIDE_KEY',

  /**  PUBLIC MEMBER KEYS */
  LAST_TRAINER_ID = 'LAST_TRAINER_ID',
  LAST_PT_COURSE_ID = 'LAST_PT_COURSE_ID',
  LAST_GT_COURSE_ID = 'LAST_GT_COURSE_ID',
  LAST_TRAINING_TYPE = 'LAST_TRAINING_TYPE',
  LAST_COMPANY_ID = 'LAST_COMPANY_ID',
  LAST_CARD_ID = 'LAST_CARD_ID',

  /** WeChat reserve notiification */
  WECHAT_RESERVE_NOTIFY_ENABLED = 'WECHAT_RESERVE_NOTIFY_ENABLED',
  /** SMS reserve notification */
  SMS_RESERVE_NOTIFY_ENABLED = 'SMS_RESERVE_NOTIFY_ENABLED',
  /** weekly dashboard report notiification */
  WEEKLY_REPORT_NOTIFY_ENABLED = 'WEEKLY_REPORT_NOTIFY_ENABLED',
}

export const DEFAULT_USER_SETTINGS: {[key: string]: string} = {
  [CACHE_KEY.WECHAT_RESERVE_NOTIFY_ENABLED]: 'true',
  [CACHE_KEY.SMS_RESERVE_NOTIFY_ENABLED]: 'false',
  [CACHE_KEY.WEEKLY_REPORT_NOTIFY_ENABLED]: 'true',
}

export const PUBLIC_MEMBER_KEYS: CACHE_KEY[] = [
  CACHE_KEY.LAST_TRAINER_ID,
  CACHE_KEY.LAST_PT_COURSE_ID,
  CACHE_KEY.LAST_TRAINING_TYPE,
  CACHE_KEY.LAST_COMPANY_ID,
  CACHE_KEY.LAST_CARD_ID,
  CACHE_KEY.LAST_GT_COURSE_ID,

  CACHE_KEY.WECHAT_RESERVE_NOTIFY_ENABLED,
  CACHE_KEY.SMS_RESERVE_NOTIFY_ENABLED,
  CACHE_KEY.WEEKLY_REPORT_NOTIFY_ENABLED,
]

export const PUBLIC_EMPLOYEE_KEYS: CACHE_KEY[] = [
  CACHE_KEY.LAST_TRAINER_ID,
  CACHE_KEY.LAST_PT_COURSE_ID,
  CACHE_KEY.LAST_TRAINING_TYPE,
  CACHE_KEY.LAST_COMPANY_ID,
  CACHE_KEY.LAST_CARD_ID,
  CACHE_KEY.LAST_GT_COURSE_ID,
]

export default class RedisService {
  private static client: redis.RedisClient = redis.createClient(config.redis)
  private entityId: number | string = 0
  private entityType: ENTITY_TYPE = ENTITY_TYPE.CUSTOMER
  private entityKey: string = ''

  constructor(entityId?: number | string, entityType?: ENTITY_TYPE) {
    if (entityId) {
      this.entityId = entityId
    }
    if (entityType) {
      this.entityType = entityType
    }
  }

  private getCacheKey(key: CACHE_KEY): string {
    let cacheKey = ''
    if (this.entityId) {
      cacheKey += `${this.entityId}:${this.entityType}:`
    }
    if (this.entityKey) {
      cacheKey += `${this.entityKey}:`
    }
    cacheKey += key
    return cacheKey
  }

  public getCache(key: CACHE_KEY, options?: { entityKey?: string }): Promise<string | null> {
    let cacheKey = this.getCacheKey(key)
    if (options && options.entityKey) {
      cacheKey += `:${options.entityKey}`
    }
    return new Promise((resolve, reject) => {
      RedisService.client.get(cacheKey, (error: Error, value: string | null) => {
        if (error) {
          return reject(error)
        }
        resolve(value)
      })
    })
  }

  /**
   * set cache by key
   * @param key cache key
   * @param val cache value
   * @param options.expireTime expired time by second, -1 for infinite
   */
  public setCache(key: CACHE_KEY, val: string, options?: {
    /** expire time in second */
    expireTime?: number,
    entityKey?: string,
  }): Promise<boolean> {
    let cacheKey = this.getCacheKey(key)
    if (options && options.entityKey) {
      cacheKey += `:${options.entityKey}`
    }
    return new Promise((resolve, reject) => {
      let expireTime = options && options.expireTime ? options.expireTime : 7 * DATE_CONST.DAY / 1000
      if (key === CACHE_KEY.GT_SEARCH) {
        expireTime = 4 * DATE_CONST.HOUR / 1000
      }
      if (expireTime > 0) {
        RedisService.client.set(cacheKey, val, 'EX', expireTime, (err: Error) => { if (err) { return reject(false) } return resolve(true) })
      } else {
        RedisService.client.set(cacheKey, val, (err: Error) => { if (err) { return reject(false) } return resolve(true) })
      }
    })
  }

  public delCache(key: CACHE_KEY, options?: { entityKey?: string }): Promise<boolean> {
    let cacheKey = this.getCacheKey(key)
    if (options && options.entityKey) {
      cacheKey += `:${options.entityKey}`
    }
    return new Promise((resolve, reject) => {
      RedisService.client.del(cacheKey, (error) => {
        if (error) {
          reject(error)
        }
        resolve(true)
      })
    })
  }
}