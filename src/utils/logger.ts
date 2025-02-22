export function logInfo(message: string) {
  console.log(`\x1b[36mSCOPEO [INFO]\x1b[0m ${message}`);
}

export function logError(message: string) {
  console.error(`\x1b[31mSCOPEO [ERROR]\x1b[0m ${message}`);
}
