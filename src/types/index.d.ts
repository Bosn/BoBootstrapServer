import { PoolOptions } from "sequelize";
import { ISequelizeConfig } from "sequelize-typescript";
import { ENTITY_TYPE, MSG_TYPE, GT_TYPE } from "../models/const";
import { Reservation, GroupTrainingMember, Customer, Employee } from '../models'
import * as redis from 'redis'

declare interface IOSSConfig {
  endpoint: string
  key: string
  secret: string
  bucket: string
}

declare interface IDateRange {
  begin: Date
  end: Date
}


declare interface IConfigOptions {
  godPass: string
  version: string
  debug: boolean
  logPath: string
  token: string
  staticRoot: string
  serve: {
    port: number
  },
  keys: string[]
  session: {
    key: string
  },
  keycenter?: string | boolean
  db: ISequelizeConfig
  oss: IOSSConfig
  aliyun: {
    key: string
    secret: string
  },
  redis: redis.ClientOpts
}

declare interface IOption {
  label: string
  value: string | number
}

declare interface IEntity {
  entityId: number
  entityType: ENTITY_TYPE
}

declare interface IEntitySummary {
  id: number
  sex: boolean
  name: string
  avatarImg: string
  desc: string
}

declare type Entity = Customer | Employee

declare interface IOpResult {
  isOk: boolean,
  errMsg?: string
}

export type OpResultSucceed = { isOk: true }
export type OpResultFail = { isOk: false, errMsg: string }
export type OpResult = OpResultSucceed | OpResultFail

declare interface IOpCreateResult extends IOpResult {
  data?: {
    createdId?: number
    createdIds?: number[]
  }
}

declare interface IGTSearchCache {
  startDate: number
  endDate: number
  type: GT_TYPE
  mine: boolean
  curCardId?: number
}

declare interface IOptionItem {
  text: string
  value: string | number
}

declare interface IResCreate {
  isOk: boolean
  errMsg?: string
  data: {
    createdId?: number
  }
}


declare type TOrder = 'asc' | 'desc'

declare interface IPager {
  offset: number
  limit: number
  order?: TOrder
  orderBy?: string
  query?: string
}
