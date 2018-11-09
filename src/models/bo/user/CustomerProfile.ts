import { Table, Model, Column, PrimaryKey, DataType, AllowNull, ForeignKey, BelongsTo } from 'sequelize-typescript'
import { Customer } from '../..'

@Table({ timestamps: true, tableName: "customerProfile" })
export default class CustomerProfile extends Model<CustomerProfile> {
  @AllowNull(false)
  @ForeignKey(() => Customer)
  @PrimaryKey
  @Column
  customerId!: number

  @BelongsTo(() => Customer, 'customerId')
  customer!: Customer

  @AllowNull(false)
  @Column({ comment: '客户资料访问权限：true:private, false:public' })
  isPrivate!: boolean

  @Column({ type: DataType.STRING(191), comment: '客户SNS签名' })
  signature!: string
}