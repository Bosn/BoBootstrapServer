import Utility from "../utility"
import DBUtility from "../utility/db"

before(async function () {
  await DBUtility.dropDB()
  await Utility.prepare()

  // routes cases
  await import('./routes/index.spec')

  // service cases
  await import('./service/lib.spec')
  await import('./service/membership.spec')
  await import('./service/redis.spec')
})

after(async function () {
  await Utility.closeServer()
})

it('Startup test cases.', function() {})