type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
}

class Logger {
  private isProduction = process.env.NODE_ENV === 'production';
  private isDevelopment = process.env.NODE_ENV === 'development';

  private log(level: LogLevel, message: string, data?: any): void {
    const logEntry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString()
    };

    // In development, always log to console
    if (this.isDevelopment) {
      this.logToConsole(level, message, data);
    }

    // In production, only log errors and warnings
    if (this.isProduction && (level === 'error' || level === 'warn')) {
      this.logToConsole(level, message, data);
      // TODO: In a real app, send to external logging service
      this.logToStorage(logEntry);
    }
  }

  private logToConsole(level: LogLevel, message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    switch (level) {
      case 'debug':
        console.debug(`${prefix} ${message}`, data || '');
        break;
      case 'info':
        console.info(`${prefix} ${message}`, data || '');
        break;
      case 'warn':
        console.warn(`${prefix} ${message}`, data || '');
        break;
      case 'error':
        console.error(`${prefix} ${message}`, data || '');
        break;
    }
  }

  private logToStorage(logEntry: LogEntry): void {
    try {
      const logs = this.getStoredLogs();
      logs.push(logEntry);
      
      // Keep only last 100 log entries
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      localStorage.setItem('app_logs', JSON.stringify(logs));
    } catch (error) {
      // Silent fail if localStorage is not available
    }
  }

  private getStoredLogs(): LogEntry[] {
    try {
      const storedLogs = localStorage.getItem('app_logs');
      return storedLogs ? JSON.parse(storedLogs) : [];
    } catch {
      return [];
    }
  }

  debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: any): void {
    this.log('error', message, data);
  }

  // Get recent logs for debugging
  getRecentLogs(): LogEntry[] {
    return this.getStoredLogs();
  }

  // Clear stored logs
  clearLogs(): void {
    try {
      localStorage.removeItem('app_logs');
    } catch {
      // Silent fail
    }
  }
}

// Export singleton instance
export const logger = new Logger();