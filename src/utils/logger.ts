/**
 * 간단한 로거 유틸리티
 * - 에러는 토스트로 표시
 * - 개발 환경에서만 콘솔 출력
 */
class SimpleLogger {
  private isDevelopment = import.meta.env.DEV;

  error(message: string, _error?: unknown, additionalInfo?: Record<string, unknown>): void {
    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, additionalInfo);
    }
    
    // 에러는 항상 토스트로 표시 (단순화)
    if (this.isDevelopment && typeof window !== 'undefined') {
      try {
        // 개발 환경에서만 토스트 표시
        console.warn(`Toast: ${message}`);
      } catch {
        // 무시
      }
    }
  }

  warn(message: string, additionalInfo?: Record<string, unknown>): void {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, additionalInfo);
    }
  }

  info(message: string, additionalInfo?: Record<string, unknown>): void {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, additionalInfo);
    }
  }

  debug(message: string, additionalInfo?: Record<string, unknown>): void {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, additionalInfo);
    }
  }
}

export const logger = new SimpleLogger();