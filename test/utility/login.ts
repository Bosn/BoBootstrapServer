import * as chai from 'chai'
import chaiHttp = require('chai-http')
import Utility from '../utility'
import config from '../../src/config'

chai.use(chaiHttp)

export default class LoginService {
  private agent: ChaiHttp.Agent
  private account: string

  constructor(account: string) {
    this.account = account
    this.agent = chai.request.agent(Utility.getServer())
  }
  public static getAgent() {
    return chai.request.agent(Utility.getServer())
  }
  public async login(): Promise<ChaiHttp.Agent> {
    const that = this
    let account = this.account
    const password = config.godPass
    return await request()
    function request(): Promise<ChaiHttp.Agent> {
      return new Promise(resolve => {
        that.agent.post(`/login`)
          .send({ account, password })
          .then(function () {
            resolve(that.agent)
          })
      })
    }
  }

  public async close() {
    (<any>this.agent).close()
  }
}