import { Table, Model, Column, PrimaryKey, DataType, AllowNull, ForeignKey } from 'sequelize-typescript'
import { Employee } from '../..'

@Table({ timestamps: true, tableName: "employeeProfile" })
export default class EmployeeProfile extends Model<EmployeeProfile> {
    @AllowNull(false)
    @ForeignKey(() => Employee)
    @PrimaryKey
    @Column
    employeeId!: number

    @Column({ type: DataType.STRING(191), comment: '员工SNS签名' })
    signature!: string
}