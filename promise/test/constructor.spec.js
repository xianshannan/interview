const Promise = require('../')
const resolveValue = {}
const promiseObj = new Promise(function(resolve) {
  resolve(resolveValue)
})

describe('The Promise Constructor', function() {
  it('has `Object.getPrototypeOf(promise) === Promise.prototype`', function() {
    expect(Object.getPrototypeOf(promiseObj) === Promise.prototype).to.equal(
      true
    )
    it('has `promise.constructor === Promise`', function() {
      expect(promise.constructor === Promise).to.equal(true)
    })
    it('has `promise.constructor === Promise.prototype.constructor`', function() {
      expect(promise.constructor === Promise.prototype.constructor).to.equal(
        true
      )
    })
    it('has `Promise.length === 1`', function() {
      expect(Promise.length === 1).to.equal(true)
    })
  })

  describe('If resolver is not a function', function() {
    it('must throw a `TypeError`', function() {
      try {
        new Promise({})
      } catch (ex) {
        expect(ex instanceof TypeError).to.equal(true)
        return
      }
      throw new Error('Should have thrown a TypeError')
    })
  })

  describe('If resolver is a function', function() {
    it("must be called with the promise's resolver arguments", function(done) {
      new Promise(function(resolve, reject) {
        expect(typeof resolve === 'function').to.equal(true)
        expect(typeof reject === 'function').to.equal(true)
        done()
      })
    })
    it('must be called immediately, before `Promise` returns', function() {
      let called = false
      new Promise(function(resolve, reject) {
        called = true
      })
      expect(called).to.equal(true)
    })
  })
})
