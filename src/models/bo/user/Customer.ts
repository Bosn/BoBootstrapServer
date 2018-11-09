import { Table, Model, AutoIncrement, Column, PrimaryKey, DataType, AllowNull, Default, Scopes } from 'sequelize-typescript'
import { ENTITY_TYPE, SCOPE_TYPE, ACCESS_TYPE } from '../../const'


@Scopes({
  [SCOPE_TYPE.SUMMARY]: {
    attributes: ['id', 'name', 'nickname', 'mobile'],
    where: {
      valid: true,
    },
  },
})
@Table({ timestamps: true, tableName: 'customer' })
export default class Customer extends Model<Customer> {
  @AutoIncrement
  @PrimaryKey
  @Column
  id!: number

  @AllowNull(false)
  @Column({ comment: 'true:male, false:female' })
  sex!: boolean

  @Column({ comment: '生日，格式19880622或0622，8位或4位' })
  birthday!: string

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

  @AllowNull(false)
  @Default(true)
  @Column
  valid!: boolean

  @Column({ type: DataType.STRING(191), comment: 'user avatar image' })
  avatarImg!: string

  @Column(DataType.STRING(191))
  email!: string

  @Default(1)
  @Column({ comment: '证件类型：1-身份证;2-护照;100-其它' })
  identityType!: IDENTITY_TYPE

  @Column({ type: DataType.STRING(191), comment: '证件号码' })
  identityNo!: string

  @Column({ type: DataType.STRING(191), comment: '紧急联络人姓名' })
  emergencyContactName!: string

  @Column({ type: DataType.STRING(191), comment: '紧急联络人电话' })
  emergencyContactPhone!: string

  @Column({ type: DataType.STRING(191), comment: '紧急联络人关系' })
  emergencyContactRelationship!: string

  @Column({ type: DataType.TEXT })
  desc!: string

  @Column({type: DataType.TEXT})
  address!: string

  entityType?: ENTITY_TYPE
  accessList?: ACCESS_TYPE[]
  openId?: string
  sessionKey?: string
}

export enum IDENTITY_TYPE {
  /** China Identity Card */
  ID= 1,
  /** Passport */
  PASSPORT = 2,
  /** for others */
  OTHER = 100,
}