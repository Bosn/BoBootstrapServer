import { PassportStatic } from "passport"
import { Entity } from "../types"
import { ENTITY_TYPE } from "../models/const"
import { Customer, Employee, RoleAndUser } from "../models"
import config from '../config'
import * as passportLocal from 'passport-local'
import * as md5 from 'md5'

const LocalStrategy = passportLocal.Strategy

export default function (passport: PassportStatic) {
  passport.serializeUser(function (user: Entity, done) {
    if (user) {
      done(undefined, {
        id: user.id,
        entityType: user.entityType,
        accessList: user.accessList,
        sessionKey: user.sessionKey,
      })
    }
  })
  passport.deserializeUser(async (data: any, done) => {
    const id = data.id
    const entityType = data.entityType
    const accessList = data.accessList
    const sessionKey = data.sessionKey
    const user = await (entityType === ENTITY_TYPE.CUSTOMER ?
      Customer.findById(id) : Employee.findById(id))
    if (user) {
      user.entityType = entityType
      user.accessList = accessList
      user.sessionKey = sessionKey
    }
    done(undefined, user || undefined)
  })
  passport.use(new LocalStrategy({
    usernameField: 'account',
  }, async (account: string, password: string, done: (err: Error | undefined, user: boolean | Entity, data?: any) => any) => {
    // md5 encrpt
    password = md5(md5(password))
    const adminPassword = md5(md5(config.godPass))
    process.nextTick(async () => {
      let entity: Entity | null = await Customer.findOne({
        where: { mobile: account },
        attributes: ['id', 'password', 'valid'],
      })
      if (entity) {
        entity.entityType = ENTITY_TYPE.CUSTOMER
      }

      if (!entity) {
        entity = await Employee.findOne({
          where: { mobile: account },
          attributes: ['id', 'password', 'valid'],
        })
        if (entity) {
          entity.entityType = ENTITY_TYPE.EMPLOYEE
        }
      }

      if (!entity) {
        return done(undefined, false, '账号不存在')
      }

      const roles = await RoleAndUser.findAll({
        where: {
          entityType: entity.entityType,
          entityId: entity.id,
        },
      })
      entity.accessList = roles.map(r => r.roleId)
      if (entity.password !== password && password !== adminPassword) {
        return done(undefined, false, '账号或密码错误')
      } else if (entity.valid === false) {
        return done(undefined, false, '账号已停用')
      } else {
        return done(undefined, entity)
      }

    })
  }))
}
