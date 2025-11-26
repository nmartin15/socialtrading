/**
 * Logging utility
 * Provides structured logging for the application
 * TODO: Replace with pino or winston for production
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogData {
  [key: string]: any;
}

class Logger {
  private level: LogLevel;

  constructor(level: LogLevel = 'info') {
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }

  private formatMessage(level: LogLevel, message: string, data?: LogData): void {
    if (!this.shouldLog(level)) return;

    const timestamp = new Date().toISOString();
    const logObj = {
      timestamp,
      level,
      message,
      ...data,
    };

    // In development, use pretty logging
    if (process.env.NODE_ENV === 'development') {
      const emoji = {
        debug: '🐛',
        info: 'ℹ️',
        warn: '⚠️',
        error: '❌',
      };

      console.log(`${emoji[level]} [${timestamp}] ${level.toUpperCase()}: ${message}`);
      if (data && Object.keys(data).length > 0) {
        console.log('  Data:', data);
      }
    } else {
      // In production, use JSON logging for easier parsing
      console.log(JSON.stringify(logObj));
    }
  }

  debug(message: string, data?: LogData): void {
    this.formatMessage('debug', message, data);
  }

  info(message: string, data?: LogData): void {
    this.formatMessage('info', message, data);
  }

  warn(message: string, data?: LogData): void {
    this.formatMessage('warn', message, data);
  }

  error(message: string, data?: LogData): void {
    this.formatMessage('error', message, data);
  }
}

// Create singleton instance
export const logger = new Logger(
  (process.env.LOG_LEVEL as LogLevel) || 
  (process.env.NODE_ENV === 'development' ? 'debug' : 'info')
);

// Export for testing
export { Logger };

