exports.sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchAndRetryIfNecessary = async (
  callFn,
  retryAfter = 1000,
  sleepMultiple = 1,
  maxTimeSleep = 0,
  jitter = false
) => {
  try {
    const res = await callFn();
    return res;
  } catch (error) {
    if (error.code === 429) {
      let time =
        maxTimeSleep === 0 ? retryAfter : Math.min(maxTimeSleep, retryAfter);
      if (jitter) {
        time = Math.floor(
          (crypto.getRandomValues(new Uint32Array(1))[0] / 4294967295) * time
        );
      }
      await sleep(time);
      return fetchAndRetryIfNecessary(
        callFn,
        retryAfter * sleepMultiple,
        sleepMultiple,
        maxTimeSleep,
        jitter
      );
    } else {
      throw error;
    }
  }
};

/**
 * Call a function and retry if getting an error 429 (too many request)
 * @param {Function} fn function that need to call
 * @param {number} retryAfter recall the function after wait in millisecond
 * @param {number} sleepMultiple multiply retryAfter
 * @param {number} maxTimeSleep max time to waiting for recall the function
 * @param {boolean} jitter
 * @returns
 */
exports.callFn = async (
  fn,
  retryAfter = 1000,
  sleepMultiple = 1,
  maxTimeSleep = 0,
  jitter = false
) =>
  fetchAndRetryIfNecessary(
    () => fn(),
    retryAfter,
    sleepMultiple,
    maxTimeSleep,
    jitter
  );
