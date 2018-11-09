import { Table, Model, Column, PrimaryKey, DataType } from 'sequelize-typescript'

@Table({ timestamps: true, tableName: "role" })
export default class Role extends Model<Role> {
    @PrimaryKey
    @Column
    id!: number

    @Column(DataType.STRING(191))
    name!: string
}