import { LiquidiumError, LiquidiumErrorCode } from "../errors";

const MIN_ATTEMPTS = 1;
const MIN_INITIAL_RETRY_DELAY_MS = 0;
const MIN_BACKOFF_MULTIPLIER = 1;

export type RetryWithBackoffOptions<T> = {
  execute: () => Promise<T>;
  maxAttempts: number;
  initialRetryDelayMs: number;
  backoffMultiplier: number;
  shouldRetryError: (error: unknown) => boolean;
  waitForDelayMs?: (delayMs: number) => Promise<void>;
};

export async function retryWithBackoff<T>(
  options: RetryWithBackoffOptions<T>
): Promise<T> {
  assertValidRetryOptions(options);

  const waitForDelayMs = options.waitForDelayMs ?? defaultWaitForDelayMs;
  let retryDelayMs = options.initialRetryDelayMs;

  for (let attempt = 1; attempt <= options.maxAttempts; attempt += 1) {
    try {
      return await options.execute();
    } catch (error) {
      const isLastAttempt = attempt === options.maxAttempts;
      if (isLastAttempt || !options.shouldRetryError(error)) {
        throw error;
      }

      await waitForDelayMs(retryDelayMs);
      retryDelayMs *= options.backoffMultiplier;
    }
  }

  throw new LiquidiumError(
    LiquidiumErrorCode.INTERNAL,
    "Retry exhausted unexpectedly"
  );
}

async function defaultWaitForDelayMs(delayMs: number): Promise<void> {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

function assertValidRetryOptions<T>(options: RetryWithBackoffOptions<T>): void {
  if (options.maxAttempts < MIN_ATTEMPTS) {
    throw new LiquidiumError(
      LiquidiumErrorCode.VALIDATION_ERROR,
      `Retry maxAttempts must be at least ${MIN_ATTEMPTS}, received ${options.maxAttempts}`
    );
  }

  if (options.initialRetryDelayMs < MIN_INITIAL_RETRY_DELAY_MS) {
    throw new LiquidiumError(
      LiquidiumErrorCode.VALIDATION_ERROR,
      "Retry initialRetryDelayMs must be a non-negative number"
    );
  }

  if (options.backoffMultiplier < MIN_BACKOFF_MULTIPLIER) {
    throw new LiquidiumError(
      LiquidiumErrorCode.VALIDATION_ERROR,
      `Retry backoffMultiplier must be at least ${MIN_BACKOFF_MULTIPLIER}, received ${options.backoffMultiplier}`
    );
  }
}
