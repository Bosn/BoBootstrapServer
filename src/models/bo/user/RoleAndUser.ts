import { Table, Model, Column, ForeignKey, AllowNull, AutoIncrement, PrimaryKey } from 'sequelize-typescript'
import { Role } from '../..'

@Table({ timestamps: true, tableName: "roleAndUser" })
export default class RoleAndUser extends Model<RoleAndUser> {
  @AutoIncrement
  @PrimaryKey
  @Column
  id!: number

  @ForeignKey(() => Role)
  @Column
  roleId!: number

  @AllowNull(false)
  @Column({ comment: 'related entity id' })
  entityId!: number

  @AllowNull(false)
  @Column({ comment: 'releated entity type' })
  entityType!: number
}