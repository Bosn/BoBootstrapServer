import { EmployeeProfile, Employee, CustomerProfile, Customer, RoleAndUser, UserSetting } from '../models'
import { IOpResult, Entity } from "../types"
import { ENTITY_TYPE, ACCESS_TYPE, COMMON_ERR_RES_CODE } from '../models/const'
import { USER_SETTING_KEY } from '../models/bo/user/UserSetting'
import { Transaction } from 'sequelize'
import * as md5 from 'md5'
import { Sequelize } from 'sequelize-typescript'
import lib from './Lib'
import sequelize from '../models/sequelize'
import RedisService, { CACHE_KEY, PUBLIC_MEMBER_KEYS, PUBLIC_EMPLOYEE_KEYS } from './RedisService'

const utils = lib.utils
const Op = Sequelize.Op
export default class MembershipService {
  /**
   * get entity by id and type
   * @param entityId
   * @param entityType
   */
  public static async  getEntity(entityId: number, entityType: ENTITY_TYPE): Promise<Entity | null> {
    return await (entityType === ENTITY_TYPE.EMPLOYEE ? Employee.findById(entityId) : Customer.findById(entityId))
  }

  public static async addOrUpdateCustomer(params: {
    id: number,
    name: string,
    mobile: string,
    sex: boolean,
    password?: string,
    avatarImg?: string,
    advisorId?: number,
    trainers?: Array<{ id: number, name: string }>

    // extended properties
    memberCardId?: string
    memberCardId2?: string
    memberClassName?: string
    advisorName?: string
    address?: string
    closetId?: string,
  }): Promise<IOpResult & { id: number }> {

    try {
      return await sequelize.transaction(async transaction => {

        params.mobile = params.mobile.replace(/[^\d]/g, '')

        if (!params.password) { // prevent passwort set by empty string
          delete params.password
        }

        if (!params.avatarImg) {
          delete params.avatarImg
        }

        if (
          (await Customer.count({ where: { [Op.or]: { mobile: params.mobile, account: params.mobile }, id: { [Op.not]: params.id || 0 } } })) > 0 ||
          (await Employee.count({ where: { [Op.or]: { mobile: params.mobile, account: params.mobile }, id: { [Op.not]: params.id || 0 } } })) > 0
        ) {
          throw new Error(`手机号码已使用过，请换个手机号再试试吧。点击返回，重新录入。`)
        }

        const result = await (params.id ? edit(transaction) : add(transaction))
        return result
      })
    } catch (ex) {
      return { isOk: false, errMsg: ex.message, id: 0 }
    }

    async function edit(transaction: Transaction): Promise<IOpResult & { id: number }> {
      let obj = await Customer.findById(params.id)
      obj = Object.assign(obj, params)
      if (obj.account !== params.mobile) {
        obj.account = params.mobile
      }
      if (params.password) {
        obj.password = md5(md5(params.password))
      }
      await obj.save({ transaction })
      return { isOk: true, id: obj.id }
    }

    async function add(transaction: Transaction): Promise<IOpResult & { id: number }> {
      // validating mobile number unique
      params = Object.assign(params, {
        account: params.mobile,
        nickname: '',
        level: 1,
      })

      if (params.password) {
        params.password = md5(md5(params.password))
      } else {
        params.password = '**reserve**'
      }

      const customer = await Customer.create(params, { transaction })

      await RoleAndUser.create({
        roleId: ACCESS_TYPE.MEMBER_ACCESS,
        entityId: customer.id,
        entityType: ENTITY_TYPE.CUSTOMER,
      }, { transaction })

      await MembershipService.getCustomerProfile(customer.id, transaction)
      return { isOk: true, id: customer.id }
    }
  }

  public static async getCustomerProfile(customerId: number, transaction?: Transaction): Promise<CustomerProfile> {
    const customer = await Customer.findById(customerId, { transaction })
    if (!customer) {
      throw new Error(COMMON_ERR_RES_CODE.ERROR_PARAMS)
    }
    let cp = await CustomerProfile.findById(customerId, { transaction })
    if (!cp) {
      cp = await CustomerProfile.create({
        customerId,
        isPrivate: true,
        signature: undefined,
        feedbackPosition: 0,
        activeDegreeSum: 0,
        reminderEnabled: 0,
        reminderEnabled2: 0,
        reminderTime: 4,
        reminderTime2: 24,
      }, { transaction })
    }
    return cp
  }

  public static async  getEmployeeProfile(employeeId: number): Promise<EmployeeProfile> {
    const employee = await Employee.findById(employeeId, { attributes: ['id'] })
    if (!employee) {
      throw new Error(COMMON_ERR_RES_CODE.ERROR_PARAMS)
    }
    let profile = await EmployeeProfile.findById(employeeId)
    if (!profile) {
      profile = await EmployeeProfile.create({
        employeeId,
      })
    }
    return profile
  }

  public static async  getCustomerSummary(customerId: number) {
    return await Customer.findById(customerId, {
      attributes: ['id', 'name'],
    })
  }

  public static async  getEmployeeSummary(employeeId: number) {
    return await Employee.findById(employeeId, {
      attributes: ['id', 'name', 'nickname'],
    })

  }

  public static async  getEmployeeSummaryList() {
    return await Employee.findAll({
      where: {
        valid: true,
      },
      attributes: ['id', 'name'],
    })
  }

  public static async getUserSetting(entityId: number, entityType: ENTITY_TYPE, key: USER_SETTING_KEY) {
    return await UserSetting.findOne({
      where: {
        entityId, entityType, key,
      },
    })
  }

  public static async setUserSetting(entityId: number, entityType: ENTITY_TYPE, key: USER_SETTING_KEY, value: string, transaction?: Transaction) {
    const o = await this.getUserSetting(entityId, entityType, key)
    if (o) {
      o.value = value
      o.changed('value', true)
      await o.save({ transaction })
    } else {
      await UserSetting.create({
        entityId,
        entityType,
        key,
        value,
      }, { transaction })
    }
  }

  public static async deleteEntity(entityId: number, entityType: ENTITY_TYPE) {
    const entity = entityType === ENTITY_TYPE.EMPLOYEE ? await Employee.findById(entityId)
      : await Customer.findById(entityId)
    if (!entity) {
      throw new Error(COMMON_ERR_RES_CODE.ERROR_PARAMS)
    }
    const randomName = `t${Date.now()}`
    entity.valid = false
    entity.account = randomName
    entity.mobile = randomName
    entity.name = entity.name + '[DELETED]'
    await entity.save()
    await RoleAndUser.destroy({
      where: {
        entityId, entityType,
      },
    })
  }

  public static async queryCustomer(query: string): Promise<Partial<Customer>[]> {
    if (query && query.trim()) {
      return await Customer.findAll({
        attributes: ['id', 'name', 'mobile', 'sex', 'avatarImg'],
        where: {
          [Op.or]: {
            name: { [Op.like]: `%${query}%` },
            mobile: { [Op.like]: `%${query}%` },
            id: query,
          },
          valid: true,
        },
        limit: 50,
      })
    } else {
      return []
    }
  }

  public static async getGuideKey(entityId: number, entityType: ENTITY_TYPE, key: string) {
    const redis = new RedisService(entityId, entityType)
    const val = await redis.getCache(CACHE_KEY.GUIDE_KEY, { entityKey: key })
    if (val) {
      return true
    } else {
      await redis.setCache(CACHE_KEY.GUIDE_KEY, 'true', { entityKey: key, expireTime: -1 })
      return false
    }
  }

  public static async getUserSettings(entityId: number, entityType: ENTITY_TYPE, keys: CACHE_KEY[]): Promise<{ [key: string]: string }> {
    const redis = new RedisService(entityId, entityType)
    const result: { [key: string]: string } = {}
    for (const key of keys) {
      const value = await redis.getCache(key as CACHE_KEY)
      result[key] = value || ''
    }
    return result
  }

  public static isPublicUserSettingKeys(entityType: ENTITY_TYPE, keys: CACHE_KEY[]): boolean {
    for (const key of keys) {
      if ((entityType === ENTITY_TYPE.CUSTOMER && PUBLIC_MEMBER_KEYS.indexOf(key) === -1) ||
        (entityType === ENTITY_TYPE.EMPLOYEE && PUBLIC_EMPLOYEE_KEYS.indexOf(key) === -1)) {
        return false
      }
    }
    return true
  }

  public static async clearUserSetting(entityId: number, entityType: ENTITY_TYPE, key: CACHE_KEY) {
    const redis = new RedisService(entityId, entityType)
    await redis.delCache(key)
  }

  public static async updateUserSetting(entityId: number, entityType: ENTITY_TYPE, key: CACHE_KEY, value: string) {
    const redis = new RedisService(entityId, entityType)
    await redis.setCache(key, value, { expireTime: -1 })
  }

  public static async updateSummaryData(curUser: Entity, { nickname, signature, avatarImg }:
    { nickname?: string, signature?: string, avatarImg?: string }) {
    if (nickname) {
      curUser.nickname = nickname
    }
    if (avatarImg) {
      curUser.avatarImg = avatarImg
    }
    if (nickname || avatarImg) {
      await curUser.save()
    }
    const profile = await (curUser.entityType === ENTITY_TYPE.CUSTOMER ?
      MembershipService.getCustomerProfile(curUser.id) :
      MembershipService.getEmployeeProfile(curUser.id))
    if (typeof signature === 'string') {
      if (signature.length > 50) {
        signature = signature.substring(0, 10)
      }
      signature = utils.htmlHelper.filter(signature)
      profile.signature = signature || ''
      await profile.save()
    }
  }

}