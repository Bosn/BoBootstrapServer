import { Table, Model, Column, AllowNull, DataType } from 'sequelize-typescript'

@Table({ timestamps: true, tableName: "userSetting" })
export default class UserSetting extends Model<UserSetting> {
  @AllowNull(false)
  @Column({ comment: 'related entity id' })
  entityId!: number

  @AllowNull(false)
  @Column({ comment: 'releated entity type' })
  entityType!: number

  @AllowNull(false)
  @Column({ type: DataType.STRING(191) })
  key!: USER_SETTING_KEY

  @AllowNull(false)
  @Column({ type: DataType.TEXT })
  value!: string
}

export enum USER_SETTING_KEY {
  GIFT_PT_NUM_CUR_MONTH = 'GIFT_PT_NUM_CUR_MONTH',
  FAVORITE_MENU_LABEL_LIST = 'FAVORITE_MENU_LABEL_LIST',
}