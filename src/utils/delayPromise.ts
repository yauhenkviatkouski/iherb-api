export const delayPromise = (delayMs: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, delayMs);
  });
};
