import { IConfigOptions } from "../types/index"

const IS_PRE = process.env.IS_PRE === 'true'

const config: IConfigOptions = {
  version: '1.0',
  debug: false,
  godPass: '',
  logPath: '/root/log/node/',
  token: '',
  staticRoot: '',
  serve: {
    port: IS_PRE ? 6000 : 5000,
  },
  keys: ['BoBootstrap'],
  session: {
    key: 'bob:sess',
  },
  db: {
    dialect: 'mysql',
    host: '',
    port: 3306,
    username: '',
    password: '',
    database: IS_PRE ? 'bob_db_test' : 'bob_db',
    timezone: '+08:00',
    pool: {
      max: 100,
      min: 0,
      idle: 10000,
      acquire: 60000,
    },
    logging: false,
  },
  oss: {
    endpoint: '',
    key: '',
    secret: '',
    bucket: '',
  },
  aliyun: {
    key: '',
    secret: '',
  },
  redis: {
    host: '',
    password: '',
  },
}

export default config
