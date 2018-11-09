import { IConfigOptions } from "../types"
import { NODE_ENV_TYPE } from "../models/const"
import ConfigDev from './config.dev'
import ConfigTest from './config.test'
import ConfigProd from './config.prod'

let configObj: IConfigOptions

switch (process.env.NODE_ENV) {
  case NODE_ENV_TYPE.DEV:
    configObj = ConfigDev
    break
  case NODE_ENV_TYPE.TEST:
    configObj = ConfigTest
    break
  case NODE_ENV_TYPE.PROD:
    configObj = ConfigProd
    break
  default:
    throw new Error(`Unsupported NODE_ENV=${process.env.NODE_ENV}`)
}

export default configObj
