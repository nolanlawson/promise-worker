/**
 * Make this worker a promise-worker
 *
 * @param callback Callback function for processing the inbound data
 */
declare function registerPromiseWorker<TMessageIn = any, TMessageOut = any>(
  callback: (message: TMessageIn) => Promise<TMessageOut> | TMessageOut
): void;

export default registerPromiseWorker;
