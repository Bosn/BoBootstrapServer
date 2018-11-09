import config from '../../src/config'
import { Express } from 'express'
import SysEventEmitter from '../../src/event/sysEventEmitter'
import { SYS_EVENT_TYPE } from '../../src/models/const'
import { Server } from 'http'
import DBUtility from './db'
import LogService from '../../src/service/LogService'


const logger = LogService.getLogger()

const sysEventEmitter = SysEventEmitter.Emitter

export default class Utility {
  private static app: Express
  private static server: Server
  private static initialized = false

  private static initApp() {
    this.app = require('../../src/scripts/app').default
  }

  /**
   * get Express server
   */
  public static getServer() {
    if (!this.server) {
      if (!this.app) {
        this.initApp()
      }
      this.server = this.app.listen(config.serve.port)
      logger.info(`Test server running on ${config.serve.port}`)
    }
    return this.server
  }

  /**
   * get Express app
   */
  public static getApp() {
    if (!this.app) {
      this.initApp()
    }
    return this.app
  }

  /**
   * perform DB create
   */
  public static async prepare(): Promise<void> {
    await DBUtility.prepare()
    await this.startup()
    await DBUtility.initBaseData()
  }

  public static async startup(): Promise<void> {
    if (this.initialized) {
      return
    }
    Utility.getServer()
    await this.waitForSyncFinished()
    this.initialized = true
  }

  /**
   * perform DB clean up
   */
  public static async cleanup(): Promise<void> {
    await DBUtility.cleanup()
    await this.closeServer()
  }

  public static closeServer(): Promise<void> {
    return new Promise(resolve => {
      this.getServer().close(() => {
        this.server = undefined
        this.app = undefined
        resolve()
      })
    })
  }

  /**
   * wait for sequelize sync complete
   */
  private static waitForSyncFinished(): Promise<void> {
    return new Promise(resolve => {
      sysEventEmitter.on(SYS_EVENT_TYPE.DB_SYNC_FINISHED, function () {
        resolve()
      })
    })
  }
}

