import { ENTITY_TYPE } from "../models/const"
import { RoleAndUser } from '../models'
import sequelize from "../models/sequelize"
import { Customer } from '../models'
import { IPager } from "../types"
import { Op } from "sequelize"
import * as _ from 'lodash'


const SUMMARY_ATTIBUTES = ['id', 'sex', 'name', 'avatarImg', 'mobile']

export default class CustomerService {

  public static async getCustomer(id: number) {
    return await Customer.findById(id, {
      attributes: [...SUMMARY_ATTIBUTES, 'birthday', 'email', 'identityType', 'identityNo', 'emergencyContactName',
        'emergencyContactPhone', 'emergencyContactRelationship', 'address'],
    })
  }

  public static async getAllCustomers(): Promise<Customer[]> {
    return await Customer.findAll({
      where: { valid: 1 },
      attributes: ['id', 'name', 'mobile'],
      order: [['id', 'desc']],
    })
  }
  public static getAccessList(customerId: number): Promise<number[]> {
    return new Promise<number[]>(async resolve => {
      const list: RoleAndUser[] = await RoleAndUser.findAll({
        where: {
          entityId: customerId,
          entityType: ENTITY_TYPE.CUSTOMER,
        },
      })
      const result: number[] = []
      for (const item of list) {
        result.push(item.roleId)
      }
      resolve(result)
    })
  }

  public static getValidCustomerIdList(): Promise<number[]> {
    return new Promise(async resolve => {
      const startDate = new Date()
      const endDate = new Date()
      startDate.setMonth(startDate.getMonth() - 1)
      resolve(await queryList(startDate, endDate))
    })
    async function queryList(startDate: Date, endDate: Date) {
      const sql = `SELECT DISTINCT customerId
          FROM reservation r
          JOIN customer c ON c.id = r.customerId
          WHERE startDate > ${+startDate} AND startDate < ${+endDate}`
      return await sequelize.query(sql).spread<number[], { customerId: number }[]>(result => {
        const list: number[] = []
        for (const row of result) {
          list.push(+row.customerId)
        }
        return list
      })
    }
  }

  public static async getCustomerName(id: number): Promise<string> {
    const customer = await Customer.findById(id, { attributes: ['name'] })
    if (customer) {
      return customer.name
    }
    return ''
  }

  /**
   * is valid customer
   * @param obj
   * @returns true => valid, string => error message
   */
  public static isValidCustomer(obj: Partial<Customer>): true | string {
    const arr: string[] = []
    if (!obj.name) arr.push('姓名')
    if (!obj.mobile) arr.push('电话')
    return arr.length > 0 ? arr.join(',') : true
  }

  /**
   * get customer list
   * @param pager
   */
  public static async getCustomerList(
    pager: IPager,
  ) {
    const { offset, limit } = pager
    const whereOption = {
      valid: true,
    }

    if (pager.query) {
      (<any>whereOption)[Op.or] = {
        name: {
          [Op.like]: `%${pager.query}%`,
        },
        id: pager.query,
        mobile: {
          [Op.like]: `${pager.query}%`,
        },
      }
    }

    const result = await Customer.findAndCountAll({
      attributes: SUMMARY_ATTIBUTES,
      where: whereOption,
      order: [[pager.orderBy || '', pager.order || '']],
      offset,
      limit,
    })
    return result
  }
}