import * as express from 'express'
import * as path from 'path'
import * as bodyParser from 'body-parser'
import * as passport from 'passport'
import * as ConnectRedis from 'connect-redis'
import * as cookieParser from 'cookie-parser'
import LogService from '../service/LogService'
import routes from '../routes/index'
import * as session from 'express-session'
import config from '../config'
import PassportService from '../service/Passport'
import { initSequelize } from '../models/sequelize'
import EmployeeRoute from '../routes/employee'
import CustomerRoute from '../routes/customer'

const Redis = ConnectRedis(session)
const app = express()
const logger = LogService.getLogger()
const rootDir = process.cwd()

logger.info(`Node server is starting with NODE_ENV=${process.env.NODE_ENV}`)

initSequelize().then(() => {
  PassportService(passport)

  app.set('views', path.join(rootDir, `${path.sep}views`))
  app.set('view engine', 'pug')
  app.use(bodyParser.json({ limit: "50mb" }))
  app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }))
  app.use(cookieParser())
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(LogService.getExpressLogger())
  app.use(session({
    secret: 'bobsecret',
    store: new Redis({
      host: config.redis.host,
      pass: config.redis.password,
    }),
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      httpOnly: false,
    },
  }))
  app.use(passport.initialize())
  app.use(passport.session())

  // load routes
  app.use('/', routes(passport))
  app.use('/employee/', EmployeeRoute)
  app.use('/customer/', CustomerRoute)

  // error log
  app.use(LogService.getExpressErrorLogger())

  // catch 404 and forward to error handler
  app.use(function (_req, _res, next) {
    const err: any = new Error('Not Found')
    err.status = 404
    next(err)
  })
})

export default app