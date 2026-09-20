import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Environment configuration for AI Codebase Doctor
 * Validates required environment variables at startup
 */
export class EnvironmentConfig {
  private static instance: EnvironmentConfig;
  
  public readonly geminiApiKey: string;
  public readonly nodeEnv: string;
  
  private constructor() {
    // Validate required environment variables
    this.geminiApiKey = process.env.GEMINI_API_KEY || '';
    this.nodeEnv = process.env.NODE_ENV || 'development';
    
    this.validate();
  }
  
  /**
   * Singleton pattern to ensure single configuration instance
   */
  public static getInstance(): EnvironmentConfig {
    if (!EnvironmentConfig.instance) {
      EnvironmentConfig.instance = new EnvironmentConfig();
    }
    return EnvironmentConfig.instance;
  }
  
  /**
   * Validate that all required environment variables are present
   */
  private validate(): void {
    const missing: string[] = [];
    
    if (!this.geminiApiKey) {
      missing.push('GEMINI_API_KEY');
    }
    
    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(', ')}\n` +
        'Please check your .env file or environment configuration.'
      );
    }
  }
  
  /**
   * Check if running in production environment
   */
  public isProduction(): boolean {
    return this.nodeEnv === 'production';
  }
  
  /**
   * Check if running in development environment
   */
  public isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }
}

// Export singleton instance
export const config = EnvironmentConfig.getInstance();
