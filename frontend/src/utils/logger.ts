import moment from "moment"

type LogEntry = {
  message: string
  context?: any
  timestamp: string
}

class Logger {
  private logs: LogEntry[] = []
  private maxLogs: number = 20

  public log(message: string, context?: any) {
    const logEntry: LogEntry = {
      message,
      context,
      timestamp: moment().format("YYYY-MM-DD HH:mm:ss"),
    }
    this.logs.push(logEntry)
    this.checkLogLimit()
  }

  private checkLogLimit() {
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }
  }

  getLogs(): LogEntry[] {
    return this.logs
  }
}

const logger = new Logger()
if (typeof window !== "undefined") {
  ;(window as any).logger = logger
}
export default logger
