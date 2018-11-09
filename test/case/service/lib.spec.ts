import { expect } from 'chai'
import lib from '../../../src/service/Lib'

describe('service/lib', function() {
  describe('dateHelper', function() {
    it('formatTime & formatDate', function() {
      const formatTime = lib.utils.dateHelper.formatTime
      const formatDate = lib.utils.dateHelper.formatDate

      let result: any = formatTime(new Date())
      expect(result).to.be.a('string')
      expect(result).have.lengthOf(5)

      result = formatDate(new Date())
      expect(result).to.be.a('string')
      expect(result).have.lengthOf(10)

      result = new Date(formatDate(new Date()) + ' ' + formatTime(new Date()))
      expect(+result).is.not.NaN
    })
  })
})
