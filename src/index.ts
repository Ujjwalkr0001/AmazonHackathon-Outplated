/**
 * AI Codebase Doctor - Core Analysis Engine
 * Entry point for AI-powered code analysis
 */

import { config } from './config/environment';

console.log('🩺 AI Codebase Doctor - Core Engine');
console.log('Environment:', config.nodeEnv);
console.log('Gemini API:', config.geminiApiKey ? '✓ Configured' : '✗ Missing');

export * from './types/doctor';
export * from './config/environment';
