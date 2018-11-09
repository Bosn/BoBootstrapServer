import { Sequelize } from 'sequelize-typescript'
import config from '../../src/config'
import { Role, Employee,  RoleAndUser, Customer } from '../../src/models'
import { ENTITY_TYPE, EMPLOYEE_NORMAL_ACCESS_TYPE_LIST, ACCESS_TYPE } from '../../src/models/const'
import { PRIMARY_MEMBER, PRIMARY_ADMIN, SECONDARY_ADMIN, SECONDARY_MEMBER, PRIMARY_TRAINER  } from '../const'


export default class DBUtility {
  private static seq: Sequelize

  public static async prepare() {
    await this.createDB()
  }

  /**
   * init essential data like roles and primary admin
   */
  public static async initBaseData() {
    await this.createBaseData()
  }

  public static async cleanup() {
    await this.dropDB()
    await this.seq.close()
  }

  private static async createDB() {
    const sql = `CREATE DATABASE ${config.db.database} DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    await this.executeSQL(sql)
    const configSql = `SET @@global.sql_mode = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION';`
    await this.executeSQL(configSql)
  }

  /**
   * create essential data like roles, initial admin account...
   */
  private static async createBaseData() {
    const MembershipService = require('../../src/service/MembershipService').default
    await Role.bulkCreate(EMPLOYEE_NORMAL_ACCESS_TYPE_LIST.map(item => ({ id: item.value })))

    // init admin
    await Employee.create({
      id: PRIMARY_ADMIN.id,
      sex: true,
      account: PRIMARY_ADMIN.account,
      mobile: PRIMARY_ADMIN.account,
      name: PRIMARY_ADMIN.name,
      valid: true,
      nickname: `${PRIMARY_ADMIN.name} nickname`,
      password: '**reserve**',
      socialInsuranceEnabled: true,
    })

    await Employee.create({
      id: SECONDARY_ADMIN.id,
      sex: true,
      account: SECONDARY_ADMIN.account,
      mobile: SECONDARY_ADMIN.account,
      name: SECONDARY_ADMIN.name,
      valid: true,
      nickname: `${SECONDARY_ADMIN.name} nickname`,
      password: '**reserve**',
      socialInsuranceEnabled: true,
    })

    // init trainer
    await Employee.create({
      id: PRIMARY_TRAINER.id,
      sex: true,
      account: PRIMARY_TRAINER.account,
      mobile: PRIMARY_TRAINER.account,
      name: PRIMARY_TRAINER.name,
      valid: true,
      nickname: `${PRIMARY_TRAINER.name} nickname`,
      password: '**reserve**',
      socialInsuranceEnabled: true,
    })


    // init member
    await Customer.create({
      id: PRIMARY_MEMBER.id,
      sex: true,
      account: PRIMARY_MEMBER.account,
      mobile: PRIMARY_MEMBER.account,
      name: PRIMARY_MEMBER.name,
      nickname: `${PRIMARY_MEMBER.name} nickname`,
      password: '**reserve**',
      valid: true,
      sessionNum: 0,
    })

    await Customer.create({
      id: SECONDARY_MEMBER.id,
      sex: true,
      account: SECONDARY_MEMBER.account,
      mobile: SECONDARY_MEMBER.account,
      name: SECONDARY_MEMBER.name,
      nickname: `${SECONDARY_MEMBER.name} nickname`,
      password: '**reserve**',
      valid: true,
      sessionNum: 0,
      score: 0,
    })

    await RoleAndUser.create({
      roleId: ACCESS_TYPE.MEMBER_ACCESS,
      entityId: PRIMARY_MEMBER.id,
      entityType: ENTITY_TYPE.CUSTOMER,
    })

    await RoleAndUser.create({
      roleId: ACCESS_TYPE.MEMBER_ACCESS,
      entityId: SECONDARY_MEMBER.id,
      entityType: ENTITY_TYPE.CUSTOMER,
    })

    await MembershipService.getCustomerProfile(PRIMARY_MEMBER.id)

    const ACCESS_INIT_LIST = [{
      baseList: [{ entityId: PRIMARY_ADMIN.id, entityType: ENTITY_TYPE.EMPLOYEE }, { entityId: SECONDARY_ADMIN.id, entityType: ENTITY_TYPE.EMPLOYEE }],
      accesses: [ACCESS_TYPE.SUPER_ADMIN_ACCESS, ACCESS_TYPE.ADMIN_ACCESS],
    }, {
      baseList: [{ entityId: PRIMARY_TRAINER.id, entityType: ENTITY_TYPE.EMPLOYEE }],
      accesses: [],
    }]

    for (const item of ACCESS_INIT_LIST) {
      for (const base of item.baseList) {
        await RoleAndUser.bulkCreate(
          item.accesses.map(item => Object.assign({}, base, { roleId: item })),
        )
      }
    }
  }

  public static async dropDB() {
    const sql = `DROP DATABASE IF EXISTS ${config.db.database};`
    await this.executeSQL(sql)
  }

  private static async executeSQL(sql: string) {
    const that = this
    if (!that.seq) {
      that.seq = that.getSeq()
    }
    await that.seq.query(sql, { type: Sequelize.QueryTypes.RAW })
  }

  private static getSeq() {
    return new Sequelize({
      database: '',
      username: config.db.username,
      password: config.db.password,
      host: config.db.host,
      port: config.db.port,
      timezone: config.db.timezone,
      dialect: config.db.dialect,
      pool: config.db.pool,
      operatorsAliases: false,
      logging: false,
    })
  }
}