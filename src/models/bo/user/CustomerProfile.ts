import { Table, Model, Column, PrimaryKey, DataType, AllowNull, ForeignKey, Default, BelongsTo } from 'sequelize-typescript'
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

  @AllowNull(false)
  @Column({ comment: '总活跃度 / 累积活跃度' })
  activeDegreeSum!: number

  @AllowNull(false)
  @Column({ comment: '记录上次客户提交反馈时的累积活跃度位置。' })
  feedbackPosition!: number

  @AllowNull(false)
  @Default(0)
  @Column({ comment: '每月已临时取消额次数' })
  tempCancelNum!: number

  @Column({ comment: '最近一次临时取消的日期' })
  tempCancelDate!: Date

  @Default(1)
  @Column({ comment: '提醒1是否启用' })
  reminderEnabled!: boolean

  @Default(1)
  @Column({ comment: '提醒2是否启用' })
  reminderEnabled2!: boolean
  @Default(4)
  @Column({ type: DataType.FLOAT, comment: '多久前提醒，单位：小时' })
  reminderTime!: number

  @Default(24)
  @Column({ type: DataType.FLOAT, comment: '多久前提醒，单位：小时' })
  reminderTime2!: number

}