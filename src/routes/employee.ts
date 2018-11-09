import { Router } from 'express'
import * as RouterBase from './base'
import { ACCESS_TYPE, DEFAULT_PAGER_OFFSET, DEFAULT_PAGER_LIMIT, COMMON_ERR_RES } from '../models/const'
import { Employee } from '../models'
import EmployeeService from '../service/EmployeeService'
const router: Router = Router()

router.get('/list', RouterBase.isLoggedIn(), async (req, res) => {
  const offset = +req.query.offset || DEFAULT_PAGER_OFFSET
  const limit = +req.query.limit || DEFAULT_PAGER_LIMIT
  const order = req.query.order || 'desc'
  const orderBy = req.query.orderBy || 'id'
  const query = req.query.query
  const result = await EmployeeService.getEmployeeList({ offset, limit, order, orderBy, query })
  res.json({
    isOk: true,
    data: {
      count: result.count,
      rows: result.rows.map(i => ({
        id: i.id,
        sex: i.sex,
        name: i.name,
        nickname: i.nickname,
        email: i.email,
        mobile: i.mobile,
        avatarImg: i.avatarImg,
        identityNo: i.identityNo,
        socialInsuranceEnabled: i.socialInsuranceEnabled,
      })),
    },
  })
})

router.get('/get/:id', RouterBase.isLoggedIn(), async (req, res) => {
  const id = +req.params.id
  res.json({
    isOk: true,
    data: await EmployeeService.getEmployee(id),
  })
})

router.get('/get/accesses/:id', RouterBase.isLoggedIn(), async (req, res) => {
  const id = +req.params.id
  res.json({
    isOk: true,
    data: await EmployeeService.getEmployeeAccesses(id),
  })
})

router.post('/create', RouterBase.isLoggedIn(), async (req, res) => {
  try {
    const createdId = await EmployeeService.addEmployee(req.body)
    res.json({
      isOk: true,
      data: createdId,
    })
  } catch (e) {
    res.json({
      isOk: false,
      errMsg: e.message,
    })
  }
})

router.post('/submitBatchAccessEdit', RouterBase.isLoggedIn([ACCESS_TYPE.ADMIN_ACCESS]), async (req, res) => {
  const ids: number[] = req.body.ids
  const accesses: number[] = req.body.accesses
  const curUser = req.user as Employee
  for (const id of ids) {
    const employee = await Employee.findById(id)
    if (!employee) {
      res.json(COMMON_ERR_RES.ERROR_PARAMS)
      return
    }
  }
  await EmployeeService.batchUpdateAccesses(curUser, accesses, ids)
  res.json({
    isOk: true,
    data: ids,
  })
})

router.post('/submitBatchDataEdit', RouterBase.isLoggedIn(), async (req, res) => {
  const ids: number[] = req.body.ids
  const name = req.body.name
  const password: string = req.body.password
  const nickname: string = req.body.nickname
  const email: string = req.body.email
  const identityNo: string = req.body.identityNo
  const socialInsuranceEnabled: boolean = req.body.socialInsuranceEnabled
  const sex: boolean = req.body.sex
  let mobile: string = req.body.mobile
  const desc: string = req.body.desc
  const avatarImg: string | undefined = req.body.avatarImg

  if (mobile) {
    mobile = mobile.replace(/-/g, '')
  }
  for (const id of ids) {
    const employee = await Employee.findById(id)
    if (!employee) {
      res.json(COMMON_ERR_RES.ERROR_PARAMS)
      return
    }
  }
  await EmployeeService.batchUpdateData({
    password, name, nickname, email, identityNo,
    socialInsuranceEnabled, desc, sex, avatarImg, mobile,
  }, ids)
  res.json({
    isOk: true,
    data: ids,
  })
})

router.get('/delete/:id', RouterBase.isLoggedIn([ACCESS_TYPE.SUPER_ADMIN_ACCESS, ACCESS_TYPE.ADMIN_ACCESS]), async (req, res) => {
  const id = +req.params.id
  const employee = await Employee.findById(id)
  if (!employee) {
    res.json(COMMON_ERR_RES.ERROR_PARAMS)
    return
  }
  await EmployeeService.deleteEmployee(id)
  res.json({
    isOk: true,
  })
})

export default router
