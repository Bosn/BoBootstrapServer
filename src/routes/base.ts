import { Request, Response, NextFunction } from "express"
import { ACCESS_TYPE, ENTITY_TYPE, COMMON_ERR_RES, COMMON_ERR_RES_CODE } from "../models/const"
import { Entity } from "../types"
import { Customer, RoleAndUser, Employee } from '../models'
import RedisService, { CACHE_KEY } from "../service/RedisService"
import * as _ from 'lodash'

export function isLoggedIn(accessRequiredList?: number[]) {
  if (arguments.length > 0) {
    if (!(accessRequiredList instanceof Array)) {
      accessRequiredList = Array.prototype.slice.apply(arguments)
    }
  }

  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
      if (accessCheck(accessRequiredList, res.locals.accessList)) {
        return next()
      } else {
        const resData = COMMON_ERR_RES.ACCESS_FORBIDDEN
        const message = resData.errMsg
        res.json({ isOk: false, errMsg: message, code: COMMON_ERR_RES_CODE.ACCESS_FORBIDDEN })
      }
    } else {
      const redis = new RedisService(req.session!.id, ENTITY_TYPE.SESSION)
      // await redis.setCache(CACHE_KEY.SESSION, '您还没有登录，或登录状态过期，麻烦您重新登录。', { entityKey: 'loginMessage' })
      if (req.originalUrl) {
        await redis.setCache(CACHE_KEY.SESSION, req.originalUrl, { entityKey: 'returnUrl' })
      } else {
        await redis.delCache(CACHE_KEY.SESSION, { entityKey: 'returnUrl' })
      }
      res.redirect('/login')
    }
  }
}

/**
 *  check request access
 *
 *  @accessRequiredList {Array<Integer>} access required for this request
 *  @accessList         {Array<Integer>} access exists
 */
function accessCheck(accessRequiredList: number[] | undefined, accessList: number[]) {
  if (!accessRequiredList || !accessRequiredList.length) {
    return true
  }

  if (!accessList || !accessList.length) {
    return false
  }

  // global admin can access all pqges, except requiredList contains super access
  if (_.intersection(accessRequiredList, [ACCESS_TYPE.SUPER_ADMIN_ACCESS]).length === 0 && (
      accessList.indexOf(ACCESS_TYPE.ADMIN_ACCESS) > -1 ||
      accessList.indexOf(ACCESS_TYPE.SUPER_ADMIN_ACCESS) > -1 ||
      accessList.indexOf(ACCESS_TYPE.GOD_ACCESS) > -1
    )
  ) {
    return true
  }

  for (let i = 0, item; i < accessRequiredList.length; i++) {
    item = accessRequiredList[i]
    if (accessList.indexOf(item) > -1) {
      return true
    }
  }
  return false
}

export const isSecure = {
  entityId: async (curUser: Entity, entityIdOrIds: number | number[], entityType: ENTITY_TYPE): Promise<boolean> => {
    if (typeof entityIdOrIds === 'number') {
      const entity: Entity | null = await (entityType === ENTITY_TYPE.CUSTOMER ? Customer.findById(entityIdOrIds) : Employee.findById(entityIdOrIds))
      if (!entity) throw new Error(COMMON_ERR_RES_CODE.ERROR_PARAMS)
      return await isSecure.entity(curUser, entity, entityType)
    } else {
      for (const id of entityIdOrIds) {
        if (await isSecure.entityId(curUser, id, entityType)) {
          return true
        }
      }
      return false
    }
  },
  entity: async (curUser: Entity, entity: Entity, entityType: ENTITY_TYPE): Promise<boolean> => {
    if (!entity || !curUser) {
      return false
    }
    if (curUser.id === entity.id && curUser.entityType === entityType) {
      return true
    }
    const roleList = await RoleAndUser.findAll({ where: { entityId: curUser.id, entityType: curUser.entityType } })
    const roleMap: { [key: number]: boolean } = {}
    for (const item of roleList) {
      roleMap[item.roleId] = true
    }

    // god access
    if (roleMap[ACCESS_TYPE.GOD_ACCESS]) {
      return true
    }

    // admin checking...
    if (roleMap[ACCESS_TYPE.SUPER_ADMIN_ACCESS]) {
      return true
    }

    if (roleMap[ACCESS_TYPE.ADMIN_ACCESS]) {
      return true
    }

    // customer checking...
    if (roleMap[ACCESS_TYPE.MEMBER_ACCESS]) {
      if (entityType === ENTITY_TYPE.CUSTOMER) {
        return curUser.id === entity.id
      }
    }

    return false
  },
}

export const passIfMatchAny = (currentAccess: ACCESS_TYPE[] | undefined, passedAccess: ACCESS_TYPE[]) => {
  if (!currentAccess) {
    return false
  }
  if (!passedAccess) {
    return true
  }

  if (passedAccess && passedAccess.length === 1 && passedAccess[0] === ACCESS_TYPE.SUPER_ADMIN_ACCESS) {
    return currentAccess && currentAccess.indexOf(ACCESS_TYPE.SUPER_ADMIN_ACCESS) > -1
  }
  if (currentAccess && (currentAccess.indexOf(ACCESS_TYPE.GOD_ACCESS) > -1 || currentAccess.indexOf(ACCESS_TYPE.ADMIN_ACCESS) > -1 || currentAccess.indexOf(ACCESS_TYPE.SUPER_ADMIN_ACCESS) > -1)) {
    return true
  }
  for (const access of currentAccess) {
    if (passedAccess.indexOf(access) > -1) {
      return true
    }
  }
  return false
}

export const isAdmin = (accessList: ACCESS_TYPE[] | undefined) => passIfMatchAny(accessList, [])
export const isCustomer = (accessList: ACCESS_TYPE[] | undefined) => !!(accessList && accessList.indexOf(ACCESS_TYPE.MEMBER_ACCESS) > -1)
export const isSuperAdmin = (accessList: ACCESS_TYPE[] | undefined) => !!(accessList && (accessList.indexOf(ACCESS_TYPE.SUPER_ADMIN_ACCESS) > -1 || accessList.indexOf(ACCESS_TYPE.GOD_ACCESS) > -1))