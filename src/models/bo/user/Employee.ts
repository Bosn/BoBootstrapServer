import { Table, Model, AutoIncrement, Column, PrimaryKey, DataType, AllowNull, Default, Scopes } from 'sequelize-typescript'
import { ENTITY_TYPE, SCOPE_TYPE, ACCESS_TYPE } from '../../const'
import * as RouterBase from '../../../routes/base'

@Scopes({
  [SCOPE_TYPE.SUMMARY]: {
    attributes: ['id', 'name', 'nickname'],
    where: {
      valid: true,
    },
  },
})
@Table({ timestamps: true, tableName: "employee" })
export default class Employee extends Model<Employee> {
  @AutoIncrement
  @PrimaryKey
  @Column
  id!: number

  @AllowNull(false)
  @Column({ comment: 'true:male, false:female' })
  sex!: boolean

  @AllowNull(false)
  @Column(DataType.STRING(191))
  account!: string

  @AllowNull(false)
  @Column(DataType.STRING(191))
  password!: string

  @AllowNull(false)
  @Column(DataType.STRING(191))
  nickname!: string

  @AllowNull(false)
  @Column(DataType.STRING(191))
  name!: string

  @AllowNull(false)
  @Column(DataType.STRING(191))
  mobile!: string

  @Column(DataType.STRING(191))
  email!: string

  @AllowNull(false)
  @Default(true)
  @Column
  valid!: boolean

  @Column({ type: DataType.STRING(191), comment: 'user avatar image' })
  avatarImg!: string

  @Default(1)
  @Column({ comment: '证件类型：1-身份证;2-护照;100-其它' })
  identityType!: number

  @Column({ type: DataType.STRING(191), comment: '证件号码' })
  identityNo!: string

  @Column({ type: DataType.TEXT })
  desc!: string

  @AllowNull(false)
  @Default(true)
  @Column
  socialInsuranceEnabled!: boolean

  entityType?: ENTITY_TYPE
  accessList?: ACCESS_TYPE[]
  sessionKey?: string
  relationship?: number

  public isGod() {
    return this.id === 1
  }

  public isAdmin() {
    return RouterBase.isAdmin(this.accessList)
  }

  public isSuperAdmin(): boolean {
    return RouterBase.isSuperAdmin(this.accessList)
  }


  public passIfMatchAny(list: ACCESS_TYPE[]) {
    return this.accessList && RouterBase.passIfMatchAny(this.accessList, list)
  }
}