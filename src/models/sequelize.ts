import { Sequelize } from 'sequelize-typescript'
import config from '../config'
import { NODE_ENV_TYPE, SYS_EVENT_TYPE } from './const'
import LogService from '../service/LogService'
import SysEventEmitter from '../event/sysEventEmitter'

const logger = LogService.getLogger()
const sequelize = new Sequelize({
  ...config.db,
  operatorsAliases: false,
})

export async function initSequelize() {
  const sysEventEmitter = SysEventEmitter.Emitter
  sequelize.addModels([
    __dirname + '/bo/**/*',
  ])
  try {
    await sequelize.authenticate()
    sysEventEmitter.emit(SYS_EVENT_TYPE.DB_CONNECTED)
    logger.info(`bob_db connected. ${config.db.host}:${config.db.port}/${config.db.database}`)
    await sequelize.sync()
    if (process.env.NODE_ENV === NODE_ENV_TYPE.TEST) {
      sysEventEmitter.emit(SYS_EVENT_TYPE.DB_SYNC_FINISHED)
    }
    typeof process.send === 'function' && process.send('ready')
  } catch (err) {
    logger.info('Unable to connect to bob_db', err)
    process.exit(1)
  }
}

export default sequelize