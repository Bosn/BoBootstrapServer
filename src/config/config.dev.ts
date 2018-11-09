import { IConfigOptions } from "../types/index"
import * as os from 'os'

const config: IConfigOptions = {
  version: '1.0',
  debug: true,
  godPass: '1',
  logPath: `${os.homedir()}/log/`,
  token: '',
  staticRoot: '//b/public',
  serve: {
    port: 3000,
  },
  keys: ['BoBootstrap'],
  session: {
    key: 'bob:sess',
  },
  db: {
    dialect: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '',
    database: 'bob_db',
    timezone: '+08:00',
    pool: {
      max: 5,
      min: 0,
      idle: 10000,
    },
    logging: false,
  },
  aliyun: {
    key: '',
    secret: '',
  },
  oss: {
    endpoint: '',
    key: '',
    secret: '',
    bucket: '',
  },
  redis: {
    host: 'localhost',
  },
}

export default config