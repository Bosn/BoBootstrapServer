import * as redis from 'redis'
import { ENTITY_TYPE, DATE_CONST } from '../models/const'
import config from '../config'

export enum CACHE_KEY {
  GT_SEARCH = 'GT_SEARCH',
  TAGS_DATA = 'TAGS_DATA',
  ACCESS_TOKEN = 'ACCESS_TOKEN',
  SESSION = 'SESSION',
  GUIDE_KEY = 'GUIDE_KEY',
}
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
      const expireTime = options && options.expireTime ? options.expireTime : 7 * DATE_CONST.DAY / 1000
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