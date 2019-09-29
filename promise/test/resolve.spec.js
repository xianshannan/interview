const Promise = require('../')
const noop = function() {
  throw new Error('The rejected callback of then should not be excuted.')
}

describe('Calling resolve(x) in synchronous environment', function() {
  // 同步环境
  it('if x is not a promise', function(done) {
    const resolveValueOne = {}
    const resolveValueTwo = 'two'
    const resolveValueThree = 3
    const promiseObj = new Promise(resolve => {
      resolve(resolveValueOne)
    })
      .then(value => {
        expect(resolveValueOne).to.equal(value)
        return resolveValueTwo
      }, noop)
      .then(value => {
        expect(resolveValueTwo).to.equal(value)
        return resolveValueThree
      }, noop)
    promiseObj
      .then(value => {
        expect(resolveValueThree).to.equal(value)
      }, noop)
      .catch(noop)
      .finally(done)
  })

  it('if x is a promise', function(done) {
    const resolveValueOne = {}
    const resolveValueTwo = 'two'
    const resolveValueThree = 3
    const promiseObj = new Promise(resolve => {
      resolve(Promise.resolve(resolveValueOne))
    })
      .then(value => {
        expect(resolveValueOne).to.equal(value)
        return Promise.resolve(resolveValueTwo)
      }, noop)
      .then(value => {
        expect(resolveValueTwo).to.equal(value)
        return Promise.resolve(resolveValueThree)
      }, noop)
    promiseObj
      .then(value => {
        expect(resolveValueThree).to.equal(value)
      }, noop)
      .catch(noop)
      .finally(done)
  })
})

describe('Calling resolve(x) in asynchronous environment', function() {
  // 同步环境
  it('if x is not a promise', function(done) {
    const resolveValueOne = {}
    const resolveValueTwo = 'two'
    const resolveValueThree = 3
    const promiseObj = new Promise(resolve => {
      setTimeout(() => {
        resolve(resolveValueOne)
      })
    })
      .then(value => {
        expect(resolveValueOne).to.equal(value)
        return resolveValueTwo
      }, noop)
      .then(value => {
        expect(resolveValueTwo).to.equal(value)
        return resolveValueThree
      }, noop)
    promiseObj
      .then(value => {
        expect(resolveValueThree).to.equal(value)
      }, noop)
      .catch(noop)
      .finally(done)
  })

  it('if x is a promise', function(done) {
    const resolveValueOne = {}
    const resolveValueTwo = 'two'
    const resolveValueThree = 3
    const resolveValueFour = 4
    const promiseObj = new Promise(resolve => {
      resolve(
        new Promise(resolve => {
          setTimeout(() => {
            resolve(resolveValueOne)
          })
        })
      )
    })
      .then(value => {
        expect(resolveValueOne).to.equal(value)
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(resolveValueTwo)
          })
        })
      }, noop)
      .then(value => {
        expect(resolveValueTwo).to.equal(value)
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(resolveValueThree)
          })
        })
      }, noop)
    promiseObj
      .then(value => {
        expect(resolveValueThree).to.equal(value)
        return resolveValueFour
      }, noop)
      .then(value => {
        expect(resolveValueFour).to.equal(value)
      }, noop)
      .catch(noop)
      .finally(done)
  })
})
