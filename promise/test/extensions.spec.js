const Promise = require('../')

describe('Extentions', function() {
  it('Calling Promise.resolve(x)', function(done) {
    const resolveValue = [1, 2, 3, 4]
    Promise.resolve(resolveValue)
      .then(null, null)
      .then(true, true)
      .then(value => {
        expect(value).to.equal(resolveValue)
      }, null)
      .finally(done)
  })
  it('Calling Promise.reject(x)', function(done) {
    const rejectValue = [1, 2, 3, 4]
    const rejectError = {}
    Promise.reject(rejectValue)
      .catch(value => {
        expect(value).to.equal(rejectValue)
        throw rejectError
      })
      .then(null, err => {
        expect(err).to.equal(rejectError)
      })
      .finally(done)
  })
  describe('Promise.all(x)', function() {
    it('x contains no promise', function(done) {
      const promises = [1, 2, 3, 4]
      Promise.all(promises)
        .then(value => {
          expect(value).to.deep.equal(promises)
        })
        .finally(done)
    })
    it('x contains promise resolve value', function(done) {
      const promises = [1, Promise.resolve(2), 3, Promise.resolve(4)]
      Promise.all(promises)
        .then(value => {
          expect(value).to.deep.equal([1, 2, 3, 4])
        })
        .finally(done)
    })
    it('x contains promise asynchronous resolve value', function(done) {
      const promises = [
        1,
        new Promise(resolve => {
          setTimeout(() => {
            resolve(2)
          }, 200)
        }),
        3,
        Promise.resolve(4),
      ]
      Promise.all(promises)
        .then(value => {
          expect(value).to.deep.equal([1, 2, 3, 4])
        })
        .finally(done)
    })
    it('x contains promise reject value', function(done) {
      const promises = [1, Promise.reject(2), 3, Promise.resolve(4)]
      Promise.all(promises)
        .catch(err => {
          expect(err).to.equal(2)
        })
        .finally(done)
    })
  })
  describe('Promise.race(x)', function() {
    it('x is [1,2,3,4]', function(done) {
      Promise.race([1, 2, 3, 4])
        .then(value => {
          expect(value).to.equal(1)
        })
        .finally(done)
    })
    it('x is [Promise.resolve(1),2,3,4]', function(done) {
      Promise.race([1, 2, 3, 4])
        .then(value => {
          expect(value).to.equal(1)
        })
        .finally(done)
    })
    it('x is [Promise.reject(1),2,3,4]', function(done) {
      Promise.race([1, 2, 3, 4])
        .catch(err => {
          expect(err).to.equal(1)
        })
        .finally(done)
    })
    it('x is [new Promise(resolve => { setTimeout(() => { resolve() }) }),2,3,4]', function(done) {
      const one = new Promise(resolve => {
        setTimeout(() => {
          resolve()
        })
      })
      Promise.race([one, 2, 3, 4])
        .then(value => {
          expect(value).to.equal(2)
        })
        .finally(done)
    })
  })
})
