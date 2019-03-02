/**
 * A wrapper class to promisify web workers
 */
declare class PromiseWorker {
  /**
   * Pass in the worker instance to promisify
   *
   * @param worker The worker instance to wrap
   */
  constructor(worker: Worker);

  /**
   * Send a message to the worker
   *
   * The message you send can be any object, array, string, number, etc.
   * Note that the message will be `JSON.stringify`d, so you can't send functions, `Date`s, custom classes, etc.
   *
   * @param userMessage Data or message to send to the worker
   * @returns Promise resolved with the processed result or rejected with an error
   */
  public postMessage<TResult = any, TInput = any>(userMessage: TInput): Promise<TResult>;
}

export default PromiseWorker;
