import { Employee, RoleAndUser } from "../models"
import { IPager } from "../types"
import { Sequelize } from "sequelize-typescript"
import { ENTITY_TYPE, ACCESS_TYPE, RESERVE_PASSWORD,  COMMON_ERR_RES_CODE } from "../models/const"
import * as md5 from 'md5'

const Op = Sequelize.Op

const SUMMARY_ATTRIBUTES = ['id', 'sex', 'name', 'avatarImg', 'nickname', 'level', 'mobile', 'avatarImg']

export default class EmployeeService {

  public static async getEmployee(id: number) {
    return await Employee.findById(id, {
      attributes: [...SUMMARY_ATTRIBUTES, 'desc', 'email', 'identityNo', 'socialInsuranceEnabled'],
    })
  }

  public static async getEmployeeAccesses(id: number) {
    return (await RoleAndUser.findAll({
      where: {
        entityType: ENTITY_TYPE.EMPLOYEE,
        entityId: id,
      },
    })).map(x => x.roleId)
  }

  /**
   * get employee list
   * @param pager
   */
  public static async getEmployeeList(pager: IPager) {
    const { offset, limit } = pager

    const whereOption = {
      valid: true,
    }

    if (pager.query) {
      (<any>whereOption)[Op.or] = {
        name: {
          [Op.like]: `%${pager.query}%`,
        },
        id: {
          [Op.like]: `${pager.query}`,
        },
        mobile: {
          [Op.like]: `${pager.query}`,
        },
      }
    }

    const result = await Employee.findAndCountAll({
      where: whereOption,
      order: [[pager.orderBy || '', pager.order || '']],
      offset,
      limit,
    })
    return result
  }

  public static async batchUpdateAccesses(curUser: Employee, accesses: number[], ids: number[]) {
    for (const id of ids) {
      await this.updateAccesses(curUser, accesses, id)
    }
  }

  public static async updateAccesses(curUser: Employee, accesses: number[], id: number) {
    await RoleAndUser.destroy({
      where: {
        entityType: ENTITY_TYPE.EMPLOYEE,
        entityId: id,
      },
    })
    for (let roleId of accesses) {
      roleId = +roleId
      // not super admin, but trying to write super admin access, deny
      if ([ACCESS_TYPE.SUPER_ADMIN_ACCESS].indexOf(roleId) > -1 && !curUser.isSuperAdmin()) {
        continue
      }
      await RoleAndUser.create({
        roleId,
        entityType: ENTITY_TYPE.EMPLOYEE,
        entityId: id,
      })
    }
  }

  public static async batchUpdateData(params: Partial<Employee>, ids: number[]) {
    for (const id of ids) {
      await this.updateData(params, id)
    }
  }

  public static async updateData({ mobile, password, name, nickname, email, identityNo, socialInsuranceEnabled, desc, sex, avatarImg }: Partial<Employee>, id: number) {
    const employee = await Employee.findById(id)
    if (!employee) { throw new Error(COMMON_ERR_RES_CODE.ERROR_PARAMS) }
    if (typeof sex === 'boolean') {
      employee.sex = sex
    }
    if (password) {
      employee.password = generatePassword(password)
    }
    if (name) {
      employee.name = name
    }
    if (nickname) {
      employee.nickname = nickname
    }
    if (email) {
      employee.email = email
    }
    if (identityNo) {
      employee.identityNo = identityNo
    }
    if (typeof socialInsuranceEnabled === 'boolean') {
      employee.socialInsuranceEnabled = socialInsuranceEnabled
    } else {
    }
    if (desc) {
      employee.desc = desc
    }
    if (mobile) {
      employee.mobile = mobile.replace(/[^\d]/g, '')
    }
    if (avatarImg) {
      employee.avatarImg = avatarImg
    }
    await employee.save()
  }

  public static async addEmployee(e: Partial<Employee>) {
    delete e.id
    delete e.createdAt
    delete e.updatedAt
    if (e.mobile) {
      e.mobile = e.mobile.replace(/[^\d]/g, '')
    }
    if (e.mobile) {
      e.account = e.mobile
    } else {
      throw new Error('手机为必填选项')
    }
    if (e.password) {
      e.password = generatePassword(e.password)
    } else {
      e.password = RESERVE_PASSWORD
    }
    if (!e.email) {
      e.email = ''
    }
    const created = await Employee.create(e)
    return created.id
  }

  public static async deleteEmployee(id: number) {
    await Employee.update({ valid: false }, { where: { id } })
  }

}

function generatePassword(password: string) {
  return md5(md5(password))
}