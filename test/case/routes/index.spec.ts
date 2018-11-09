import { expect } from 'chai'
import LoginService from '../..//utility/login'
import { ENTITY_TYPE, ACCESS_TYPE } from '../../../src/models/const'
import Utility from '../..//utility'
import { PRIMARY_ADMIN } from '../../const'
import * as faker from 'faker'
import { Customer, RoleAndUser, Employee } from '../../../src/models'
import * as md5 from 'md5'

describe('routes/index', function () {
  let createdEmployeeId: number
  let createdCustomerId: number

  before(async () => {
    await Utility.startup()
  })

  it('login primary admin check', function (done) {
    const service = new LoginService(PRIMARY_ADMIN.account)
    service.login().then(function (agent) {
      agent.get(`/status`)
        .end(function (err, res) {
          expect(err).to.be.null
          expect(res).to.have.status(200)
          expect(res.body.isOk).to.equal(true)
          expect(res.body.data.entityId).to.equal(PRIMARY_ADMIN.id)
          expect(res.body.data.entityType).to.equal(ENTITY_TYPE.EMPLOYEE)
          done()
        })
    })
  })

  it('add new customer', async function () {
    const service = new LoginService(PRIMARY_ADMIN.account)
    const agent = await service.login()
    const mobile = faker.phone.phoneNumber()
    const name = faker.name.findName()
    const sex = faker.random.boolean()
    const birthday = '0622'
    const identityType = 1
    const identityNo = faker.random.number(99999999) + ''
    const desc = faker.random.words(20)
    const emergencyContactName = faker.name.findName()
    const emergencyContactPhone = faker.phone.phoneNumber()
    const emergencyContactRelationship = 'friend'
    const password = 'testpass'

    await request()

    const customer = await Customer.findOne({ where: { mobile: mobile.replace(/[^\d]/g, '') } })
    createdCustomerId = customer.id
    expect(customer).not.to.be.null
    expect(customer.name).to.equal(name)
    expect(customer.sex).to.equal(sex)
    expect(customer.account).to.equal(customer.mobile)
    expect(customer.mobile).to.equal(customer.mobile)
    expect(customer.birthday).to.equal(birthday)
    expect(customer.identityType).to.equal(identityType)
    expect(customer.identityNo).to.equal(identityNo)
    expect(customer.desc).to.equal(desc)
    expect(customer.emergencyContactName).to.equal(emergencyContactName)
    expect(customer.emergencyContactPhone).to.equal(emergencyContactPhone)
    expect(customer.emergencyContactRelationship).to.equal(emergencyContactRelationship)
    expect(customer.password).to.equal(md5(md5(password)))
    expect(customer.valid).to.equal(true)

    const roles = await RoleAndUser.findAll({ where: { entityId: customer.id, entityType: ENTITY_TYPE.CUSTOMER } })
    expect(roles.length).to.equal(1)
    expect(roles[0].roleId).to.equal(ACCESS_TYPE.MEMBER_ACCESS)

    function request() {
      return new Promise(resolve => {
        const params = {
          type: 0, name, mobile, sex, birthday, identityType, identityNo, desc,
          emergencyContactName, emergencyContactPhone, emergencyContactRelationship, password,
        }
        agent.post("/customer/update/0")
          .send(params)
          .end(function (err, res) {
            expect(err).to.be.null
            expect(res).to.have.status(200)
            resolve()
          })
      })
    }
  })

  it('edit customer', async function () {
    const id = createdCustomerId
    const service = new LoginService(PRIMARY_ADMIN.account)
    const agent = await service.login()
    const mobile = faker.phone.phoneNumber()
    const name = faker.name.findName()
    const sex = faker.random.boolean()
    const birthday = '0622'
    const identityType = 1
    const identityNo = faker.random.number(99999999) + ''
    const desc = faker.random.words(20)
    const emergencyContactName = faker.name.findName()
    const emergencyContactPhone = faker.phone.phoneNumber()
    const emergencyContactRelationship = 'friend'
    const password = 'testpass'

    await request()
    const customer = await Customer.findById(id)
    expect(customer).not.to.be.null
    expect(customer.name).to.equal(name)
    expect(customer.sex).to.equal(sex)
    expect(customer.mobile).to.equal(customer.mobile)
    expect(customer.birthday).to.equal(birthday)
    expect(customer.identityType).to.equal(identityType)
    expect(customer.identityNo).to.equal(identityNo)
    expect(customer.desc).to.equal(desc)
    expect(customer.emergencyContactName).to.equal(emergencyContactName)
    expect(customer.emergencyContactPhone).to.equal(emergencyContactPhone)
    expect(customer.emergencyContactRelationship).to.equal(emergencyContactRelationship)
    expect(customer.password).to.equal(md5(md5(password)))
    expect(customer.valid).to.equal(true)

    const roles = await RoleAndUser.findAll({ where: { entityId: customer.id, entityType: ENTITY_TYPE.CUSTOMER } })
    expect(roles.length).to.equal(1)
    expect(roles[0].roleId).to.equal(ACCESS_TYPE.MEMBER_ACCESS)

    function request() {
      return new Promise(resolve => {
        agent.post(`/customer/update/${id}`)
          .send({
            type: 0, name, mobile, sex, birthday, identityType, identityNo, desc,
            emergencyContactName, emergencyContactPhone, emergencyContactRelationship, password,
          })
          .end(function (err, res) {
            expect(err).to.be.null
            expect(res).to.have.status(200)
            resolve()
          })
      })
    }
  })


  let addedEmployeePassword: string
  let addedEmployeeAccount: string
  it('add new employee', async function () {
    const service = new LoginService(PRIMARY_ADMIN.account)
    const agent = await service.login()
    const mobile = faker.phone.phoneNumber()
    const sex = faker.random.boolean()
    const name = faker.name.findName()
    const nickname = faker.name.lastName()
    const email = faker.internet.email()
    const identityType = 1
    const identityNo = faker.random.number({ min: 10000, max: 99999 }) + ''
    const socialInsuranceEnabled = faker.random.boolean()
    const accessType = [
      ACCESS_TYPE.ADMIN_ACCESS,
    ]
    const salary = 3000
    const password = faker.random.words(1)
    const desc = faker.random.words(20)


    const createdId: number = await request() as number
    const employee = await Employee.findById(createdId)
    const mobileEscaped = mobile.replace(/[^\d]/g, '')
    addedEmployeePassword = password
    addedEmployeeAccount = mobileEscaped

    createdEmployeeId = employee.id
    expect(employee).not.to.be.null
    expect(employee.mobile).to.equal(mobileEscaped)
    expect(employee.account).to.equal(mobileEscaped)
    expect(employee.sex).to.equal(sex)
    expect(employee.name).to.equal(name)
    expect(employee.nickname).to.equal(nickname)
    expect(employee.email).to.equal(email)
    expect(employee.identityType).to.equal(identityType)
    expect(employee.identityNo).to.equal(identityNo)
    expect(employee.socialInsuranceEnabled).to.equal(socialInsuranceEnabled)
    expect(employee.password).to.equal(md5(md5(password)))
    expect(employee.desc).to.equal(desc)
    expect(employee.valid).to.equal(true)

    const roles = await RoleAndUser.findAll({ where: { entityId: employee.id, entityType: ENTITY_TYPE.EMPLOYEE } })
    for (const id of accessType) {
      expect(roles.filter(x => x.roleId === id).length).to.equal(0)
    }

    async function request() {
      return new Promise(resolve => {
        const params = {
          mobile, sex, name, nickname, email, identityType, identityNo,
          socialInsuranceEnabled, accessType, salary, password, desc,
        }
        agent.post("/employee/create")
          .send(params)
          .end(function (err, res) {
            const createdId = res.body.data
            expect(err).to.be.null
            expect(res.body.isOk).to.be.true
            expect(res).to.have.status(200)
            resolve(createdId)
          })
      })
    }
  })

  it('employee login', async function () {
    const password = addedEmployeePassword
    const account = addedEmployeeAccount
    const agent = LoginService.getAgent()
    await request()

    function request() {
      return new Promise(resolve => {
        agent.post(`/login?test=true`)
          .send({ account, password })
          .end(function (err, res) {
            expect(err).to.be.null
            expect(res).to.have.status(200)
            expect(res.body.isOk).to.be.true
            resolve()
          })
      })
    }
  })

  it('edit employee', async function () {
    const id = createdEmployeeId
    const service = new LoginService(PRIMARY_ADMIN.account)
    const agent = await service.login()
    const mobile = faker.phone.phoneNumber()
    const sex = faker.random.boolean()
    const name = faker.name.findName()
    const nickname = faker.name.lastName()
    const email = faker.internet.email()
    const identityType = 1
    const identityNo = faker.random.number({ min: 10000, max: 99999 }) + ''
    const hr = faker.random.number({ min: 1, max: 100 })
    const socialInsuranceEnabled = faker.random.boolean()
    const salary = 3000
    const password = faker.random.words(1)
    const desc = faker.random.words(20)
    const mobileEscaped = mobile.replace(/[^\d]/g, '')

    addedEmployeePassword = password

    await request()
    const employee = await Employee.findOne({ where: { mobile: mobileEscaped } })
    expect(employee).not.to.be.null
    expect(employee.mobile).to.equal(mobileEscaped)
    expect(employee.sex).to.equal(sex)
    expect(employee.name).to.equal(name)
    expect(employee.nickname).to.equal(nickname)
    expect(employee.email).to.equal(email)
    expect(employee.identityType).to.equal(identityType)
    expect(employee.identityNo).to.equal(identityNo)
    expect(employee.socialInsuranceEnabled).to.equal(socialInsuranceEnabled)
    expect(employee.password).to.equal(md5(md5(password)))
    expect(employee.desc).to.equal(desc)
    expect(employee.valid).to.equal(true)

    const roles = await RoleAndUser.findAll({ where: { entityId: employee.id, entityType: ENTITY_TYPE.EMPLOYEE } })
    expect(roles.length).to.equal(0)

    async function request() {
      return new Promise(resolve => {
        const params = {
          id, mobile, sex, name, nickname, email, identityType, identityNo, ids: [id],
          hr, socialInsuranceEnabled, salary, password, desc,
        }
        agent.post(`/employee/submitBatchDataEdit`)
          .send(params)
          .end(function (err, res) {
            expect(err).to.be.null
            expect(res).to.have.status(200)
            resolve()
          })
      })
    }
  })
})