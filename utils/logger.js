
const colors = {
    reset: "\x1b[0m",
    cyan: "\x1b[36m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
};

const log = (level, message, color) => {
    const timestamp = new Date().toISOString();
    console.log(`${color}[${level.toUpperCase()}]${colors.reset} ${timestamp}: ${message}`);
};

const logger = {
    info: (message) => log('info', message, colors.cyan),
    warn: (message) => log('warn', message, colors.yellow),
    error: (message) => log('error', message, colors.red),
};

module.exports = logger;