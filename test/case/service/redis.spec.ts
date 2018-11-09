import { should, expect } from 'chai'
import RedisService, { CACHE_KEY } from '../../../src/service/RedisService'
import * as faker from 'faker'
import { PRIMARY_MEMBER } from '../../const'
import { ENTITY_TYPE } from '../../../src/models/const'

should()

describe('service/redis', function() {
  it ('base cache check', async() => {
    const redisService = new RedisService()
    const randomVals = JSON.stringify({ data: faker.random.words(10) })
    expect(await redisService.setCache(CACHE_KEY.GT_SEARCH, randomVals)).to.be.true;
    (await redisService.getCache(CACHE_KEY.GT_SEARCH)).should.be.equal(randomVals)
    expect(await redisService.delCache(CACHE_KEY.GT_SEARCH)).to.be.true
    expect(await redisService.getCache(CACHE_KEY.GT_SEARCH)).to.be.null
  })

  it('customer cache check', async () => {
    const customerId = PRIMARY_MEMBER.id
    const redisService = new RedisService(customerId, ENTITY_TYPE.CUSTOMER)
    const randomVals = faker.random.words(10)

    const redisServiceBase = new RedisService()
    expect(await redisService.setCache(CACHE_KEY.GT_SEARCH, randomVals)).to.be.true;
    (await redisService.getCache(CACHE_KEY.GT_SEARCH)).should.be.equal(randomVals)
    expect(await redisServiceBase.getCache(CACHE_KEY.GT_SEARCH)).to.be.null
    expect(await redisService.delCache(CACHE_KEY.GT_SEARCH)).to.be.true
    expect(await redisService.getCache(CACHE_KEY.GT_SEARCH)).to.be.null
    expect(await redisServiceBase.getCache(CACHE_KEY.GT_SEARCH)).to.be.null
  })
})