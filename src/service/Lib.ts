import { IDateRange, IOptionItem } from "../types"
import { DATE_CONST } from "../models/const"

const xss = require('xss')
const hexcase = 0

function hex_sha1(s: any) {
  return binb2hex(core_sha1(AlignSHA1(s)))
}

function core_sha1(blockArray: any) {
  const x = blockArray
  const w = Array(80)
  let a = 1732584193
  let b = -271733879
  let c = -1732584194
  let d = 271733878
  let e = -1009589776
  for (let i = 0; i < x.length; i += 16) {
    const olda = a
    const oldb = b
    const oldc = c
    const oldd = d
    const olde = e
    for (let j = 0; j < 80; j++) {
      if (j < 16) { w[j] = x[i + j] } else { w[j] = rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1) }
      const t = safe_add(safe_add(rol(a, 5), sha1_ft(j, b, c, d)), safe_add(safe_add(e, w[j]), sha1_kt(j)))
      e = d
      d = c
      c = rol(b, 30)
      b = a
      a = t
    }
    a = safe_add(a, olda)
    b = safe_add(b, oldb)
    c = safe_add(c, oldc)
    d = safe_add(d, oldd)
    e = safe_add(e, olde)
  }
  return new Array(a, b, c, d, e)
}

function sha1_ft(t: any, b: any, c: any, d: any) {
  if (t < 20) { return (b & c) | ((~b) & d) }
  if (t < 40) { return b ^ c ^ d }
  if (t < 60) { return (b & c) | (b & d) | (c & d) }
  return b ^ c ^ d
}

function sha1_kt(t: any) {
  return (t < 20) ? 1518500249 : (t < 40) ? 1859775393 : (t < 60) ? -1894007588 : -899497514
}

function safe_add(x: any, y: any) {
  const lsw = (x & 0xFFFF) + (y & 0xFFFF)
  const msw = (x >> 16) + (y >> 16) + (lsw >> 16)
  return (msw << 16) | (lsw & 0xFFFF)
}

function rol(num: any, cnt: any) {
  return (num << cnt) | (num >>> (32 - cnt))
}

function AlignSHA1(str: any) {
  const nblk = ((str.length + 8) >> 6) + 1, blks = new Array(nblk * 16)
  let i
  for (i = 0; i < nblk * 16; i++) { blks[i] = 0 }
  for (i = 0; i < str.length; i++) { blks[i >> 2] |= str.charCodeAt(i) << (24 - (i & 3) * 8) }
  blks[i >> 2] |= 0x80 << (24 - (i & 3) * 8)
  blks[nblk * 16 - 1] = str.length * 8
  return blks
}

function binb2hex(binarray: any) {
  const hex_tab = hexcase ? '0123456789ABCDEF' : '0123456789abcdef'
  let str = ''
  for (let i = 0; i < binarray.length * 4; i++) {
    str += hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8 + 4)) & 0xF) +
      hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8)) & 0xF)
  }
  return str
}

function getOpenId(url: string) {
  if (!url || typeof url !== 'string') return
  const key = 'tofakeid='
  const startIndex = url.indexOf(key)
  url = url.substring(startIndex + key.length)
  if (url.indexOf('&') !== -1) {
    url = url.substring(0, url.indexOf('&'))
  }
  return url
}

function formatDate(d: number | string | Date, type?: undefined | 'yyyyMMdd' | 'MM/dd' | 'std') {
  if (typeof d === 'number' || typeof d === 'string') {
    d = new Date(+d)
  }

  const year = d.getFullYear()
  const month = addZero(d.getMonth() + 1 + '')
  const day = addZero(d.getDate() + '')

  if (type === 'yyyyMMdd') {
    return year + month + day
  } else if (type === 'MM/dd') {
    return month + '/' + day
  } else if (type === 'std') {
    return year + '/' + month + '/' + day
  }
  return year + '-' + month + '-' + day
}

function formatTime(d: number | string | Date) {
  if (typeof d === 'number' || typeof d === 'string') {
    d = new Date(+d)
  }
  return addZero(d.getHours() + '') + ':' + addZero(d.getMinutes() + '')
}

function formatDay(d: number): string {
  if (d === 1) return '一'
  if (d === 2) return '二'
  if (d === 3) return '三'
  if (d === 4) return '四'
  if (d === 5) return '五'
  if (d === 6) return '六'
  if (d === 0) return '日'
  return ''
}

function setZero(d: number | string | Date) {
  if (typeof d === 'number' || typeof d === 'string') {
    d = new Date(+d)
  }
  d.setHours(0)
  d.setMinutes(0)
  d.setSeconds(0)
  d.setMilliseconds(0)
  return d
}

function setFull(d: number | string | Date) {
  if (typeof d === 'number' || typeof d === 'string') {
    d = new Date(+d)
  }
  d.setHours(0)
  d.setMinutes(0)
  d.setSeconds(0)
  d.setMilliseconds(0)
  d.setDate(d.getDate() + 1)
  d.setMilliseconds(-1)
  return d
}

function moveByDay(d: number | string | Date, day: number) {
  if (typeof d === 'number' || typeof d === 'string') {
    d = new Date(+d)
  }
  d.setDate(d.getDate() + day)
  return d
}

function addZero(str: string) {
  str = str + ''
  if (str && str.length === 1) {
    return '0' + str
  }
  return str
}

function convertDate(date: string) {
  if (typeof date === 'string' && date.length === 8) {
    date = date.substring(0, 4) + '-' + date.substring(4, 6) + '-' + date.substring(6)
  }
  return date
}

function getDayRange(date: Date): IDateRange {
  const begin = setZero(date || new Date())
  const end = new Date(+begin)
  end.setDate(end.getDate() + 1)
  return { begin, end }
}

function getMonthRange(date: Date): IDateRange {
  const beginDate = date || new Date()
  beginDate.setDate(1)
  beginDate.setHours(0)
  beginDate.setMinutes(0)
  beginDate.setSeconds(0)
  let endDate
  endDate = new Date(beginDate.getTime())
  endDate.setMonth(endDate.getMonth() + 1)
  return { begin: beginDate, end: endDate }
}

function getMonthRangeByOffset(offset?: number): IDateRange {
  if (!offset) {
    offset = 0
  }
  const d = new Date()
  d.setMonth(d.getMonth() + offset)
  setZero(d)
  d.setDate(1)
  const begin = new Date(+d)
  d.setMonth(d.getMonth() + 1)
  const end = new Date(+d)
  return { begin, end }
}

/**
 * is date in range
 */
function isDateInRange(date: Date, range: { begin: Date, end: Date }) {
  return +date >= +range.begin && +date < +range.end
}

function htmlFilter(source: string) {
  const html = xss(source, {
    whiteList: [],
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script'],
  })
  return html
}

function paramFilter(p: string) {
  if (p) {
    return p.toString().replace(/[<>='"*@?!\./\\\[\]()&#^$]/g, '')
  } else {
    return ''
  }
}

function formatPayType(val: number | string) {
  val = +val
  let str = ''
  // 1-有赞收银-支付宝,2-有赞收银-微信,3-POS机刷卡, 4-POS机扫码, 5-微信转账, 6-支付宝转账, 7-现金,99-其它（请备注
  if (val === 1) {
    str += '美团/有赞收银-支付宝'
  } else if (val === 2) {
    str += '美团/有赞收银-微信'
  } else if (val === 3) {
    str += 'POS机刷卡'
  } else if (val === 4) {
    str += 'POS机扫码'
  } else if (val === 5) {
    str += '微信转账'
  } else if (val === 6) {
    str += '支付宝转账'
  } else if (val === 7) {
    str += '现金'
  } else if (val === 99) {
    str += '其它'
  } else {
    str += '-'
  }
  return str
}

function formatSourceType(sourceType: number | string) {
  sourceType = +sourceType
  if (sourceType === 1) {
    return '点评'
  } else if (sourceType === 2) {
    return '推荐'
  } else if (sourceType === 3) {
    return ' 续课'
  } else if (sourceType === 4) {
    return '活动'
  } else if (sourceType === 5) {
    return '预售'
  } else {
    return '其它'
  }
}

function getDateRangeByOffset(offset: number): IDateRange {
  if (offset >= 0 || offset <= -24) {
    offset = 0
  }
  const startDate = new Date()
  startDate.setDate(1)
  startDate.setHours(0)
  startDate.setMinutes(0)
  startDate.setSeconds(0)
  if (offset < 0) {
    startDate.setMonth(startDate.getMonth() + offset)
  }

  let endDate
  endDate = new Date(startDate.getTime())
  endDate.setMonth(endDate.getMonth() + 1)
  return { begin: startDate, end: endDate }
}

function getFileName(path: string): string {
  if (path && path.lastIndexOf('/') > -1) {
    return path.substring(path.lastIndexOf('/') + 1)
  }
  return path
}

function getMonths(howManyMonths = 24): IOptionItem[] {
  const months: IOptionItem[] = []
  const date = new Date()
  for (let i = 0; i < howManyMonths; i++) {
    if (i > 0) {
      date.setDate(1)
      date.setMonth(date.getMonth() - 1)
    }
    months.push({
      text: date.getFullYear() + '年' + (date.getMonth() + 1) + '月',
      value: -i,
    })
  }
  return months
}

function getHourRange(date: Date, hour: number): IDateRange {
  const d =  setZero(new Date(+date))
  d.setHours(Math.floor(hour));
  (hour > Math.floor(hour)) && d.setMinutes(30)
  return {
    begin: d,
    end: new Date(+d + DATE_CONST.HOUR * 0.5),
  }
}

export default {
  encryptor: hex_sha1,
  utils: {
    urlHelper: { getOpenId, getFileName },
    dateHelper: {
      formatTime, formatDate, formatDay, convertDate, getDayRange, getMonthRange,
      isDateInRange, moveByDay, setZero, setFull, getMonthRangeByOffset,
      getDateRangeByOffset, getMonths, getHourRange,
    },
    htmlHelper: { filter: htmlFilter },
    sqlHelper: { paramFilter },
  },
  formatter: { formatPayType, formatSourceType },
}