/* global importScripts registerPromiseWorker */

importScripts('../dist/promise-worker.register.js')

// Advanced arithmetic functions:
const Ops = {
  'plus': (a, b) => a + b,
  'minus': (a, b) => a - b,
  'times': (a, b) => a * b,
  'divide': (a, b) => a / b
}

// How many times we've been called.
let calculations = 0

registerPromiseWorker(async function (message) {
  // Using a function syntax (as opposeed to an arrow function) give access to a
  // DedicatedWorkerGlobalScope, which includes a console. You probably won't
  // need this.
  this.console.log(this, `recieved ${JSON.stringify(message)}`)

  // Destructure the incoming message.
  const { operator, operands } = message
  const nums = operands.map(str => Number(str))

  // Look up the operation.
  if (!(operator in Ops)) { throw Error(`${operator} is not a recognized operator`) }

  // Show off async-ness of this callback.
  await wait(1000)

  // Caculate and report result.
  const result = Ops[operator](nums[0], nums[1])
  if (isNaN(result)) { throw Error(`${operands[0]} ${operator} ${operands[1]} is not a number`) }
  ++calculations
  return { result, calculations }
})

async function wait (ms) {
  await new Promise((resolve, reject) => {
    setTimeout(() => resolve(ms), ms)
  })
}
