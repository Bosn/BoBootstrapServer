import { Table, Model, Column, PrimaryKey, DataType } from 'sequelize-typescript'

@Table({ timestamps: true, tableName: "role" })
export default class Role extends Model<Role> {
    @PrimaryKey
    @Column({ comment: '10-普通会员, 11-掌上私教预备会员, 12-掌上私教正式会员, 30-普通员工,31-教练,33-TL, 35-前台有录入客户权限的员工，50-管理层, 99-管理员,999-全系统管理员' })
    id!: number

    @Column(DataType.STRING(191))
    name!: string
}