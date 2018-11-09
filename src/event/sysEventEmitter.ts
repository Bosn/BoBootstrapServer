import * as EventEmitter from 'events'

export default class SysEventEmitter extends EventEmitter {
  public static readonly Emitter = new SysEventEmitter()
}