import { should, expect } from 'chai'
import { Role, Employee, RoleAndUser, Customer } from '../../../src/models'
import { ENTITY_TYPE, ACCESS_TYPE } from '../../../src/models/const'
import Utility from '../../utility'
import { PRIMARY_MEMBER, PRIMARY_ADMIN } from '../../const'

should()

describe('service/membership', function () {
  before(async () => {
    await Utility.startup()
  })

  it('roles test', async function () {
    const rolesLength = await Role.count()
    expect(rolesLength).to.gte(3)
  })

  it('primary admin test', async function () {
    const admin = await Employee.findById(PRIMARY_ADMIN.id)
    expect(admin).not.to.be.null

    const roles = await RoleAndUser.findAll({
      where: {
        entityId: admin.id,
        entityType: ENTITY_TYPE.EMPLOYEE,
      },
    })
    roles.filter(x => x.roleId === ACCESS_TYPE.ADMIN_ACCESS).should.have.lengthOf(1)
  })

  it('primary member test', async function () {
    const member = await Customer.findById(PRIMARY_MEMBER.id)
    expect(member).not.to.be.null

    const roles = await RoleAndUser.findAll({
      where: {
        entityId: member.id,
        entityType: ENTITY_TYPE.CUSTOMER,
      },
    })
    roles.filter(x => x.roleId === ACCESS_TYPE.MEMBER_ACCESS).should.have.lengthOf(1)
  })

})


