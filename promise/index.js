// Promises/A+ 规范 https://promisesaplus.com/
// 一个 Promise有以下几种状态:
// pending: 初始状态，既不是成功，也不是失败状态。
// fulfilled: 意味着操作成功完成。
// rejected: 意味着操作失败。

// pending 状态的 Promise 对象可能会变为 fulfilled
// 状态并传递一个值给相应的状态处理方法，也可能变为失败状态（rejected）并传递失败信息。
// 当其中任一种情况出现时，Promise 对象的 then 方法绑定的处理方法（handlers）就会被调用
// then方法包含两个参数：onfulfilled 和 onrejected，它们都是 Function 类型。
// 当 Promise 状态为 fulfilled 时，调用 then 的 onfulfilled 方法，
// 当 Promise 状态为 rejected 时，调用 then 的 onrejected 方法，
// 所以在异步操作的完成和绑定处理方法之间不存在竞争。

const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

function isFunction(fn) {
  return typeof fn === 'function'
}

function isPromise(value) {
  return (
    value &&
    isFunction(value.then) &&
    isFunction(value.catch) &&
    isFunction(value.finally)
    // 上面判断也可以用一句代码代替，不过原生的试了下，不是用下面的方式
    // value.then instanceof NPromise ||
  )
}

/**
 * @param {Function} executor
 * executor是带有 resolve 和 reject 两个参数的函数
 * Promise 构造函数执行时立即调用 executor 函数
 */
class NPromise {
  constructor(executor) {
    if (!isFunction(executor)) {
      throw new TypeError('Expected the executor to be a function.')
    }
    try {
      // 初始化状态为 PENDING
      this._status = PENDING
      // fullfilled 的值，也是 then 和 catch 的 return 值，都是当前执行的临时值
      this._nextValue = undefined
      // 当前捕捉的错误信息
      this._error = undefined
      // then、catch、finally 的异步回调列队，会依次执行
      this._callbacQueue = []
      executor(this._onFulfilled, this._onRejected)
    } catch (err) {
      this._onRejected(err)
    }
  }

  /**
   * 如果没有 .catch 错误，则在最后抛出错误
   */
  _throwErrorIfNotCatch() {
    setTimeout(() => {
      // setTimeout 是必须的，等待执行完毕，最后检测 this._error 是否还定义
      if (this._error !== undefined) {
        // 发生错误后没用 catch 那么需要直接提示
        console.error('Uncaught (in promise)', this._error)
      }
    })
  }

  _runCallbackQueue = () => {
    if (this._callbacQueue.length > 0) {
      // resolve 或者 reject 异步运行的时候，this._callbacQueue 的 length 才会大于 0
      this._callbacQueue.forEach(fn => {
        fn()
      })
      this._callbacQueue = []
    }
    this._throwErrorIfNotCatch()
  }

  /**
   * 操作成功
   * @param {Any} value 操作成功传递的值
   */
  _onFulfilled = value => {
    setTimeout(() => {
      if (this._status === PENDING) {
        this._status = FULFILLED
        this._nextValue = value
        this._error = undefined
        this._runCallbackQueue()
      }
    })
  }

  /**
   * 操作失败
   * @param {Any} reason 操作失败传递的值
   */
  _onRejected = reason => {
    setTimeout(() => {
      if (this._status === PENDING) {
        this._status = REJECTED
        this._error = reason
        this._nextValue = undefined
        this._runCallbackQueue()
      }
    })
  }

  then(onFulfilled, onRejected) {
    return new NPromise((resolve, reject) => {
      const handle = reason => {
        try {
          function handleResolve(value) {
            const _value = isFunction(onFulfilled) ? onFulfilled(value) : value
            resolve(_value)
          }

          function handleReject(err) {
            if (isFunction(onRejected)) {
              resolve(onRejected(err))
            } else {
              reject(err)
            }
          }

          if (this._status === FULFILLED) {
            if (isPromise(this._nextValue)) {
              return this._nextValue.then(handleResolve, handleReject)
            } else {
              return handleResolve(this._nextValue)
            }
          }

          if (this._status === REJECTED) {
            return handleReject(reason)
          }
        } catch (err) {
          reject(err)
        }
      }
      if (this._status === PENDING) {
        // 默认不断链的情况下，then 回电函数 Promise 的状态为 pending 状态（一定的）
        // 如 new NPromise(...).then(...) 是没断链的
        // 下面是断链的
        // var a = NPromise(...); a.then(...)
        // 当然断链了也可能是 pending 状态
        this._callbacQueue.push(() => {
          // 先使用 setTimeout 代替
          // 保证状态切换为非 PENDING 状态才会执行后续的 then、catch 或者 finally 的回调函数
          handle(this._error)
          // error 已经传递到下一个 NPromise 了，需要重置，否则会抛出多个相同错误
          // 配合 this._throwErrorIfNotCatch 一起使用，
          // 保证执行到最后才抛出错误，如果没有 catch
          this._error = undefined
        })
      } else {
        // 断链的情况下，then 回调函数 Promise 的状态为非 pending 状态的场景下
        // 如 var a = NPromise(...);
        // 过了几秒后 a.then(...) 继续链式调用就可能是非 pending 的状态了
        // 需要立即执行，不需要加入异步列队
        handle(this._error)
        // error 已经传递到下一个 NPromise 了，需要重置，否则会打印多个相同错误
        // 配合 this._throwErrorIfNotCatch 一起使用，
        // 保证执行到最后才抛出错误，如果没有 catch
        this._error = undefined
      }
    })
  }

  catch(onRejected) {
    return this.then(null, onRejected)
  }

  finally(onFinally) {
    return this.then(
      () => {
        onFinally()
        return this._nextValue
      },
      () => {
        onFinally()
        // 错误需要抛出，下一个 Promise 才会捕获到
        throw this._error
      }
    )
  }
}

NPromise.resolve = function(value) {
  return new NPromise(resolve => {
    resolve(value)
  })
}

NPromise.reject = function(reason) {
  return new NPromise((_, reject) => {
    reject(reason)
  })
}

NPromise.all = function(values) {
  return new NPromise((resolve, reject) => {
    let ret = {}
    let isError = false
    values.forEach((p, index) => {
      if (isError) {
        return
      }
      NPromise.resolve(p)
        .then(value => {
          ret[index] = value
          const result = Object.values(ret)
          if (values.length === result.length) {
            resolve(result)
          }
        })
        .catch(err => {
          isError = true
          reject(err)
        })
    })
  })
}

NPromise.race = function(values) {
  return new NPromise(function(resolve, reject) {
    values.forEach(function(value) {
      NPromise.resolve(value).then(resolve, reject)
    })
  })
}

module.exports = NPromise
