import { Router } from 'express'
import * as RouterBase from './base'
import { DEFAULT_PAGER_OFFSET, DEFAULT_PAGER_LIMIT, COMMON_ERR_RES, ENTITY_TYPE } from '../models/const'
import { Customer } from '../models'
import CustomerService from '../service/CustomerService'
import MembershipServcie from '../service/MembershipService'
const router: Router = Router()


router.get('/list', RouterBase.isLoggedIn(), async (req, res) => {
  const offset = +req.query.offset || DEFAULT_PAGER_OFFSET
  const limit = +req.query.limit || DEFAULT_PAGER_LIMIT
  const order = req.query.order || 'desc'
  const orderBy = req.query.orderBy || 'id'
  const query = req.query.query
  const data = await CustomerService.getCustomerList({ offset, limit, order, orderBy, query })
  res.json({
    isOk: true,
    data,
  })
})

router.get('/get/:id', RouterBase.isLoggedIn(), async (req, res) => {
  const id = +req.params.id
  res.json({
    isOk: true,
    data: await CustomerService.getCustomer(id),
  })
})

router.post('/update/:id', RouterBase.isLoggedIn(), async (req, res) => {
  let params = req.body
  const canEdit = true
  const id = +req.params.id

  delete params.isFetching
  if (!params.advisorId) {
    delete params.advisorId
  }
  id && delete req.query.type // CAN NOT CHANGE TYPE IN EDIT MODE

  if (id) {
    if (!canEdit) {
      res.json(COMMON_ERR_RES.ACCESS_FORBIDDEN)
      return
    }
  }
  const overwriteParams: any = {
    id,
  }
  if (req.query.type) {
    overwriteParams.type = +req.query.type
  }
  params = Object.assign(params, overwriteParams)
  const result = await MembershipServcie.addOrUpdateCustomer(params)
  res.json(result)
})

router.get('/delete/:id', RouterBase.isLoggedIn(), async (req, res) => {
  const id = +req.params.id
  const customer = await Customer.findById(id)
  if (!customer) {
    res.json(COMMON_ERR_RES.ERROR_PARAMS)
  } else {
    await MembershipServcie.deleteEntity(id, ENTITY_TYPE.CUSTOMER)
    res.json({ isOk: true })
  }
})


export default router