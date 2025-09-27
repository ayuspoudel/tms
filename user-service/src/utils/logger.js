const LEVELS = {
  DEBUG: "DEBUG",
  INFO: "INFO",
  SUCCESS: "SUCCESS",
  WARN: "WARN",
  ERROR: "ERROR",
};

function formatMessage(level, message, meta) {
  const timestamp = new Date().toISOString();
  const base = `[${timestamp}] [${level}] ${message}`;
  return meta ? `${base} ${JSON.stringify(meta)}` : base;
}

const logger = {
  debug: (msg, meta) => console.log(formatMessage(LEVELS.DEBUG, msg, meta)),
  info: (msg, meta) => console.log(formatMessage(LEVELS.INFO, msg, meta)),
  success: (msg, meta) => console.log(formatMessage(LEVELS.SUCCESS, msg, meta)),
  warn: (msg, meta) => console.warn(formatMessage(LEVELS.WARN, msg, meta)),
  error: (msg, meta) => console.error(formatMessage(LEVELS.ERROR, msg, meta)),
};

module.exports = { logger };