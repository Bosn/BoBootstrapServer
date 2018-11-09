import { PassportStatic } from 'passport'
import { Router } from 'express'
import * as RouterBase from './base'
import LogService from '../service/LogService'
import * as svgCaptcha from 'svg-captcha'
import { Sequelize } from 'sequelize-typescript'
import { Customer, Employee, CustomerProfile, EmployeeProfile } from '../models'
import {
  ENTITY_TYPE, NODE_ENV_TYPE,
  COMMON_ERR_RES,
} from '../models/const'
import RedisService, { CACHE_KEY } from '../service/RedisService'
import * as _ from 'lodash'

const router: Router = Router()
const logger = LogService.getLogger()
const Op = Sequelize.Op

export default function (passport: PassportStatic) {
  router.use(async (_req, res, next) => {
    res.header("Access-Control-Allow-Origin", "https://b")
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS')
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    res.header("Access-Control-Allow-Credentials", "true")
    next()
  })

  /* GET home page. */
  router.get('/', async (req, res) => {
    if (req.user && req.user.entityType === ENTITY_TYPE.CUSTOMER) {
      res.redirect('/v2/dolores/')
    } else {
      res.redirect('/v2/smart/')
    }
  })

  router.get('/login', async (_req, res) => {
    res.redirect('/')
  })

  /**
   * login status check
   */
  router.get('/status', (req, res) => {
    res.json(req.user ? {
      isOk: true,
      data: {
        isLogined: true,
        entityId: req.user.id,
        entityType: req.user.entityType,
      },
    } : {
        isOk: true,
        data: {
          isLogined: false,
        },
      })
  })

  router.get('/captcha', function (req, res) {
    const captcha = svgCaptcha.create()
    if (!req.session) {
      logger.error('no session')
      return
    }
    req.session.captcha = captcha.text

    res.set('Content-Type', 'image/svg+xml')
    res.status(200).send(captcha.data)
  })

  // process the login form
  router.post('/login', async (req, res, next) => {
    const redis = new RedisService(req.session!.id, ENTITY_TYPE.SESSION)
    if (req.user) {
      req.logout()
    }
    if (!req.session) {
      logger.error('no session')
      return
    }
    await redis.setCache(CACHE_KEY.SESSION, req.body.account, { entityKey: 'account' })

    if (process.env.NODE_ENV === NODE_ENV_TYPE.PROD) {
      if (!req.session.captcha || !req.body.captcha || req.session.captcha.trim().toLowerCase() !== req.body.captcha.trim().toLowerCase()) {
        res.json({
          isOk: false,
          errMsg: '验证码错误',
        })
        return
      }
    }

    if (!req.body.password || !req.body.password.trim()) {
      res.json({
        isOk: false,
        errMsg: '密码不能为空',
      })
    }
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        res.json({
          isOk: false,
          errMsg: err.message,
        })
        return
      }
      if (!user) {
        res.json({
          isOk: false,
          errMsg: info,
        })
        return
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err)
        }
        res.json({
          isOk: true,
        })
      })
    })(req, res, next)
  })

  router.get('/logout', RouterBase.isLoggedIn(), async (req, res) => {
    req.logOut()
    res.json({
      isOk: true,
    })
  })

  router.get('/now', (_req, res) => {
    res.json({
      isOk: true,
      data: new Date().getTime(),
    })
  })


  router.get('/fetchLoginInfo', async (req, res) => {
    if (!req.user) {
      res.json(COMMON_ERR_RES.NEED_LOGIN)
      return
    }

    let profile: CustomerProfile | EmployeeProfile | null
    if (req.user.entityType === ENTITY_TYPE.CUSTOMER) {
      profile = await CustomerProfile.findOne({
        where: {
          customerId: req.user.id,
        },
      })
    } else {
      profile = await EmployeeProfile.findOne({
        where: {
          employeeId: req.user.id,
        },
      })
    }
    const signature = profile ? profile.signature : ''


    res.json({
      isOk: true,
      data: {
        id: req.user.id,
        name: req.user.name,
        entityType: req.user.entityType,
        sex: req.user.sex,
        accessList: req.user.accessList,
        avatarImg: req.user.avatarImg,
        nickname: req.user.nickname,
        title: req.user.entityType === ENTITY_TYPE.EMPLOYEE ? req.user.getLevelStr() : '',
        signature,
        now: new Date(),
      },
    })
  })

  router.get('/checkMobileExists', RouterBase.isLoggedIn(), async (req, res) => {
    if (req.user.entityType !== ENTITY_TYPE.EMPLOYEE) {
      res.json(COMMON_ERR_RES.ACCESS_FORBIDDEN)
      return
    }
    const { mobile } = req.query
    let exists = false
    let existsName: string = ''
    let entityType: ENTITY_TYPE = ENTITY_TYPE.CUSTOMER
    let entityId: number = 0
    const cList = await Customer.findAll({
      where: { mobile },
      attributes: ['id', 'name'],
    })
    if (cList.length === 0) {
      const eList = await Employee.findAll({
        where: {
          [Op.or]: {
            mobile,
            account: mobile,
          },
        },
        attributes: ['id', 'name'],
      })
      if (eList.length !== 0) {
        exists = true
        existsName = `${eList[0].name}`
        entityType = ENTITY_TYPE.EMPLOYEE
        entityId = eList[0].id
      }
    } else {
      exists = true
      existsName = `${cList[0].name}`
      entityId = cList[0].id
      entityType = ENTITY_TYPE.CUSTOMER
    }
    res.json({
      isOk: true,
      data: {
        exists,
        entityType,
        entityId,
        name: existsName,
      },
    })
  })

  router.get('/accessList', RouterBase.isLoggedIn(), (req, res) => {
    res.json({
      isOk: true,
      data: req.user.accessList,
    })
  })

  router.get('/worker', (_req, res) => {
    res.send(process.env.NODE_APP_INSTANCE)
  })

  return router
}
