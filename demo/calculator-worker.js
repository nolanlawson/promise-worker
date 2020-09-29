importScripts('../dist/promise-worker.register.js');
const Ops = {
  'plus' : (a, b) => a + b,
  'minus' : (a, b) => a - b,
  'times' : (a, b) => a * b,
  'divide' : (a, b) => a / b
}

registerPromiseWorker(function (message) {
  const {operator, operands} = message;
  const nums = operands.map(str => Number(str));
  if (!(operator in Ops))
    throw Error(`${operator} is not a recognized operator`);
  const result = Ops[operator](nums[0], nums[1]);
  if (isNaN(result))
    throw Error(`${operands[0]} ${operator} ${operands[1]} is not a number`);
  return { result };
})
