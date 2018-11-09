import LogService from '../service/LogService'
import app from './app'
import config from '../config'
import sequelize from '../models/sequelize'
import * as SocketIO from 'socket.io'
import * as redisAdapter from 'socket.io-redis'
import { JOIN_ROOM } from '../models/sharedConsts/socket'

const logger = LogService.getLogger()
const IID = process.env.NODE_APP_INSTANCE || '0'
const now = () => new Date().toISOString().replace(/T/, ' ').replace(/Z/, '')
const port = config.serve.port + parseInt(IID)

const server = app.listen(port, () => {
  logger.info(`[${now()}]   worker#${IID} BoB is running as ${port}`)
})

export const io = SocketIO(server)
io.adapter(redisAdapter(config.redis))

io.on('connection', (socket) => {
  logger.debug(`Client connected.`)
  socket.on(JOIN_ROOM, (room) => {
    logger.debug(`Joined room ${room}`)
    socket.join(room)
  })
})

process.on('SIGINT', () => {
  // Stops the server from accepting new connections and finishes existing connections.
  server.close(function (err: Error) {
    if (err) {
      logger.error(err)
      process.exit(1)
    }

    sequelize.close().then(function () {
      logger.info('Sequelize service closed.')
      process.exit(0)
    })
  })
})

process.on('unhandledRejection', err => {
  LogService.getLogger().error(err)
})