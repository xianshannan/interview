const Promise = require('../')
const noopResolve = function() {
  throw new Error('The resolved callback of then should not be excuted.')
}

const noopRjected = function() {
  throw new Error('The rejected callback of then should not be excuted.')
}

describe('Calling reject(x) in synchronous environment', function() {
  // 同步环境
  it('if x is not a promise', function(done) {
    const resolveValueOne = {}
    const resolveValueTwo = 'two'
    const resolveValueThree = 3
    const rejectedValueOne = 1
    const rejectedValueTwo = new Error(2)
    const rejectedValueThree = new TypeError(3)

    new Promise((_, reject) => {
      reject(rejectedValueOne)
    })
      .then(noopResolve, err => {
        expect(rejectedValueOne).to.equal(err)
        return resolveValueOne
      })
      .then(value => {
        expect(resolveValueOne).to.equal(value)
        throw rejectedValueTwo
      }, noopRjected)
      .catch(err => {
        expect(rejectedValueTwo).to.equal(err)
        return resolveValueTwo
      })
      .then(value => {
        expect(resolveValueTwo).to.equal(value)
        throw rejectedValueThree
      }, noopRjected)
      .then(noopResolve, err => {
        expect(rejectedValueThree).to.equal(err)
        return resolveValueThree
      })
      .then(value => {
        expect(resolveValueThree).to.equal(value)
      }, noopRjected)
      .finally(done)
  })

  it('if x is a promise', function(done) {
    const resolveValueOne = {}
    const resolveValueTwo = 'two'
    const resolveValueThree = 3
    const rejectedValueOne = 1
    const rejectedValueTwo = new Error(2)
    const rejectedValueThree = new TypeError(3)

    new Promise(resolve => {
      resolve(Promise.reject(rejectedValueOne))
    })
      .then(noopResolve, err => {
        expect(rejectedValueOne).to.equal(err)
        return resolveValueOne
      })
      .then(value => {
        expect(resolveValueOne).to.equal(value)
        return Promise.reject(rejectedValueTwo)
      }, noopRjected)
      .catch(err => {
        expect(rejectedValueTwo).to.equal(err)
        return resolveValueTwo
      })
      .then(value => {
        expect(resolveValueTwo).to.equal(value)
        return Promise.reject(rejectedValueThree)
      }, noopRjected)
      .then(noopResolve, err => {
        expect(rejectedValueThree).to.equal(err)
        return resolveValueThree
      })
      .then(value => {
        expect(resolveValueThree).to.equal(value)
      }, noopRjected)
      .finally(done)
  })
})

describe('Calling reject(x) in asynchronous environment', function() {
  // 同步环境
  it('if x is not a promise', function(done) {
    const resolveValueOne = {}
    const resolveValueTwo = 'two'
    const resolveValueThree = 3
    new Promise(resolve => {
      setTimeout(() => {
        resolve(resolveValueOne)
      })
    })
      .then(value => {
        expect(resolveValueOne).to.equal(value)
        return resolveValueTwo
      })
      .then(value => {
        expect(resolveValueTwo).to.equal(value)
        return resolveValueThree
      })
      .then(value => {
        expect(resolveValueThree).to.equal(value)
      })
      .finally(done)
  })

  it('if x is a promise', function(done) {
    const resolveValueOne = {}
    const resolveValueTwo = 'two'
    const resolveValueThree = 3
    const resolveValueFour = 4
    new Promise(resolve => {
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
      })
      .then(value => {
        expect(resolveValueTwo).to.equal(value)
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(resolveValueThree)
          })
        })
      })
      .then(value => {
        expect(resolveValueThree).to.equal(value)
        return resolveValueFour
      })
      .then(value => {
        expect(resolveValueFour).to.equal(value)
      })
      .finally(done)
  })
})
