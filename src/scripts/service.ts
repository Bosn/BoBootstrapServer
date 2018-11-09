import * as TaskService from '../service/TaskService'
import * as schedule from 'node-schedule'
import { initSequelize } from '../models/sequelize'

initSequelize().then(async () => {
  // reminder task, executed per 5 mins.
  schedule.scheduleJob('*/5 * * * *', TaskService.reminderTask)
  // feedback task, executed per 30 mins. First time executed immediately.
  schedule.scheduleJob('*/30 * * * *', TaskService.feedbackTask)
})

