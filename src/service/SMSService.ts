const SMSClient = require("@alicloud/sms-sdk")
import LogService from "./LogService"
const logger = LogService.getLogger()
import config from "../config"
const accessKeyId = config.aliyun.key
const secretAccessKey = config.aliyun.secret
const SIGN_NAME = "sign name"

export default class SMSService {
  private static smsClient = new SMSClient({ accessKeyId, secretAccessKey })
  public static async test() {
  }

  public static async sendMessage() {
    // 发送短信
    this.smsClient
      .sendSMS({
        PhoneNumbers: '18888888888',
        SignName: SIGN_NAME,
        TemplateCode: "SMS_id",
        TemplateParam: JSON.stringify({
          name: `xxx先生`,
          activityName: "您贵庚呀",
          code: `1024`,
        }),
      })
      .then(
        function(res: any) {
          logger.info(res)
          // 处理返回参数
        },
        function(err: any) {
          logger.info(err)
        },
      )
  }
}
