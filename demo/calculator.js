/* global PromiseWorker */

if (window.Worker) {
  // Get elements we'll be visiting.
  const number1 = document.querySelector('#number1')
  const operation = document.querySelector('#operator')
  const number2 = document.querySelector('#number2')
  const result = document.querySelector('#result')
  const status = document.querySelector('#status')
  const myWorker = new PromiseWorker(new Worker('calculator-worker.js'))

  window.calculate = async function () {
    try {
      // Clear status.
      status.textContent =
        result.textContent =
        status.style.backgroundColor = ''

      // Get input values.
      const operands = [number1.value, number2.value]
      const operator = operation.value
      status.textContent = 'just a sec...'

      // Wait for response.
      const message = await myWorker.postMessage({ operator, operands })

      // Update result and status.
      result.textContent = message.result
      status.textContent = `performed ${message.calculations} calculation(s)`
    } catch (e) {
      // Exceptions thrown in worker will be caught here.
      // (Enter non-numerics to see this in action.)
      status.style.backgroundColor = 'red'
      status.textContent = e
    }
  }

  // If inputs change, call calculate.
  number1.onchange = number2.onchange = operation.onchange = window.calculate
} else {
  console.log('Your browser doesn\'t support web workers.')
}
