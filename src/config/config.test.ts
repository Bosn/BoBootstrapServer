import { IConfigOptions } from "../types/index"
import * as os from 'os'

const config: IConfigOptions = {
  version: '1.0',
  debug: true,
  godPass: '1',
  logPath: `${os.homedir()}/log/`,
  token: '',
  staticRoot: '',
  serve: {
    port: 5080,
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
    host: 'localhost',
  },
}

export default config