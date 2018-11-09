import { initSequelize } from '../models/sequelize'
import LogService from '../service/LogService'

const logger = LogService.getLogger()

logger.info('Task service is initializing...')
initSequelize().then(async () => {
  logger.info('Task starting...')
  // do some task
  logger.info('Task done.')
})

