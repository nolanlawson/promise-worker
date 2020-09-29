if (window.Worker) {

  const number1 = document.querySelector('#number1');
  const operation = document.querySelector('#operator');
  const number2 = document.querySelector('#number2');
  const result = document.querySelector('.result');
  const myWorker = new PromiseWorker(new Worker("calculator-worker.js"));

  number1.onchange = number2.onchange = operation.onchange = change;

  async function change () {
    try {
      result.style.backgroundColor = '';
      const operands = [number1.value, number2.value]
      const operator = operation.value;
      const message = await myWorker.postMessage({operator, operands})
      result.textContent = message.result;
    } catch (e) {
      result.style.backgroundColor = 'red';
      result.textContent = e;
    }
  }
} else {
  console.log('Your browser doesn\'t support web workers.')
}
