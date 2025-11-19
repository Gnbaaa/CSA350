import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

/**
 * Логгер утилит
 */
class Logger {
  private logDir: string;

  constructor() {
    this.logDir = join(process.cwd(), 'logs');
    if (!existsSync(this.logDir)) {
      mkdirSync(this.logDir, { recursive: true });
    }
  }

  private getLogFileName(level: string): string {
    const date = new Date().toISOString().split('T')[0];
    return join(this.logDir, `app_${date}_${level}.log`);
  }

  private formatMessage(level: string, message: string, meta?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}\n`;
  }

  private writeToFile(level: string, message: string, meta?: Record<string, unknown>) {
    const logFile = this.getLogFileName(level);
    const formatted = this.formatMessage(level, message, meta);
    const stream = createWriteStream(logFile, { flags: 'a' });
    stream.write(formatted);
    stream.end();
  }

  info(message: string, meta?: Record<string, unknown>) {
    const formatted = this.formatMessage('info', message, meta);
    console.log(formatted.trim());
    this.writeToFile('info', message, meta);
  }

  error(message: string, error?: Error | unknown, meta?: Record<string, unknown>) {
    const errorDetails = error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      : error;

    const formatted = this.formatMessage('error', message, { ...meta, error: errorDetails });
    console.error(formatted.trim());
    this.writeToFile('error', message, { ...meta, error: errorDetails });
  }

  warn(message: string, meta?: Record<string, unknown>) {
    const formatted = this.formatMessage('warn', message, meta);
    console.warn(formatted.trim());
    this.writeToFile('warn', message, meta);
  }

  debug(message: string, meta?: Record<string, unknown>) {
    if (process.env.NODE_ENV === 'development') {
      const formatted = this.formatMessage('debug', message, meta);
      console.debug(formatted.trim());
    }
    this.writeToFile('debug', message, meta);
  }
}

export const logger = new Logger();

