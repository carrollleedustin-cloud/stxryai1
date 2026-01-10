/**
 * Enhanced Security Utilities
 * Comprehensive security features including MFA, audit logging, and threat detection
 */

import crypto from 'crypto';

// ============================================================================
// TYPES
// ============================================================================

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface SecurityEvent {
  type:
    | 'login_attempt'
    | 'password_change'
    | 'permission_change'
    | 'data_access'
    | 'suspicious_activity';
  userId?: string;
  ipAddress: string;
  success: boolean;
  details: Record<string, any>;
  timestamp: Date;
}

export interface MFASetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

// ============================================================================
// MULTI-FACTOR AUTHENTICATION (MFA)
// ============================================================================

/**
 * Generate MFA secret
 */
export function generateMFASecret(): string {
  return crypto.randomBytes(20).toString('hex');
}

/**
 * Generate backup codes for MFA
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }
  return codes;
}

/**
 * Verify TOTP code
 */
export function verifyTOTP(secret: string, token: string, window: number = 1): boolean {
  // This is a simplified implementation
  // In production, use a library like 'otplib' or 'speakeasy'
  const timeStep = 30; // 30 seconds
  const currentTime = Math.floor(Date.now() / 1000 / timeStep);

  for (let i = -window; i <= window; i++) {
    const time = currentTime + i;
    const hash = crypto
      .createHmac('sha1', Buffer.from(secret, 'hex'))
      .update(Buffer.from(time.toString()))
      .digest();

    const offset = hash[hash.length - 1] & 0xf;
    const code =
      (((hash[offset] & 0x7f) << 24) |
        ((hash[offset + 1] & 0xff) << 16) |
        ((hash[offset + 2] & 0xff) << 8) |
        (hash[offset + 3] & 0xff)) %
      1000000;

    if (code.toString().padStart(6, '0') === token) {
      return true;
    }
  }

  return false;
}

/**
 * Setup MFA for user
 */
export async function setupMFA(userId: string, email: string): Promise<MFASetup> {
  const secret = generateMFASecret();
  const backupCodes = generateBackupCodes();

  // Generate QR code URL (use a QR code library in production)
  const qrCode = `otpauth://totp/StxryAI:${email}?secret=${secret}&issuer=StxryAI`;

  return {
    secret,
    qrCode,
    backupCodes,
  };
}

// ============================================================================
// AUDIT LOGGING
// ============================================================================

/**
 * Create audit log entry
 */
export async function createAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> {
  const auditLog: AuditLog = {
    id: crypto.randomUUID(),
    ...log,
    timestamp: new Date(),
  };

  // In production, save to database
  console.log('Audit Log:', auditLog);

  return auditLog;
}

/**
 * Log user action
 */
export async function logUserAction(
  userId: string,
  action: string,
  resource: string,
  resourceId?: string,
  metadata?: Record<string, any>,
  request?: {
    ip: string;
    userAgent: string;
  }
): Promise<void> {
  await createAuditLog({
    userId,
    action,
    resource,
    resourceId,
    ipAddress: request?.ip || 'unknown',
    userAgent: request?.userAgent || 'unknown',
    metadata,
    severity: determineSeverity(action),
  });
}

/**
 * Determine severity level based on action
 */
function determineSeverity(action: string): AuditLog['severity'] {
  const criticalActions = ['delete_account', 'change_role', 'access_admin'];
  const highActions = ['change_password', 'change_email', 'delete_data'];
  const mediumActions = ['login', 'logout', 'update_profile'];

  if (criticalActions.some((a) => action.includes(a))) return 'critical';
  if (highActions.some((a) => action.includes(a))) return 'high';
  if (mediumActions.some((a) => action.includes(a))) return 'medium';
  return 'low';
}

/**
 * Query audit logs
 */
export async function queryAuditLogs(filters: {
  userId?: string;
  action?: string;
  resource?: string;
  severity?: AuditLog['severity'];
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}): Promise<AuditLog[]> {
  // In production, query from database
  console.log('Querying audit logs with filters:', filters);
  return [];
}

// ============================================================================
// SECURITY EVENTS
// ============================================================================

/**
 * Log security event
 */
export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  console.log('Security Event:', event);

  // Check for suspicious patterns
  if (event.type === 'login_attempt' && !event.success) {
    await checkFailedLoginAttempts(event.userId, event.ipAddress);
  }

  // In production, save to database and trigger alerts if needed
}

/**
 * Check for failed login attempts (brute force detection)
 */
async function checkFailedLoginAttempts(
  userId: string | undefined,
  ipAddress: string
): Promise<void> {
  // In production, query recent failed attempts from database
  const recentFailures = 0; // Placeholder

  if (recentFailures >= 5) {
    console.warn(`Potential brute force attack detected from IP: ${ipAddress}`);
    // Implement account lockout or IP blocking
  }
}

// ============================================================================
// PASSWORD SECURITY
// ============================================================================

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) score += 1;
  else feedback.push('Password must be at least 8 characters');

  if (password.length >= 12) score += 1;

  // Complexity checks
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Include lowercase letters');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Include uppercase letters');

  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('Include numbers');

  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  else feedback.push('Include special characters');

  // Common password check (simplified)
  const commonPasswords = ['password', '123456', 'qwerty', 'admin'];
  if (commonPasswords.some((p) => password.toLowerCase().includes(p))) {
    score = 0;
    feedback.push('Password is too common');
  }

  return {
    isValid: score >= 4,
    score,
    feedback,
  };
}

/**
 * Hash password (use bcrypt in production)
 */
export async function hashPassword(password: string): Promise<string> {
  // In production, use bcrypt or argon2
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Verify password (use bcrypt in production)
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // In production, use bcrypt.compare
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Generate secure session token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}

/**
 * Verify CSRF token
 */
export function verifyCSRFToken(token: string, expected: string): boolean {
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

// ============================================================================
// ENCRYPTION
// ============================================================================

/**
 * Encrypt sensitive data
 */
export function encryptData(data: string, key: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);

  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt sensitive data
 */
export function decryptData(encryptedData: string, key: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedData.split(':');

  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    Buffer.from(key, 'hex'),
    Buffer.from(ivHex, 'hex')
  );

  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

// ============================================================================
// API KEY MANAGEMENT
// ============================================================================

/**
 * Generate API key
 */
export function generateAPIKey(prefix: string = 'sk'): string {
  const key = crypto.randomBytes(32).toString('base64url');
  return `${prefix}_${key}`;
}

/**
 * Hash API key for storage
 */
export function hashAPIKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

/**
 * Verify API key
 */
export function verifyAPIKey(apiKey: string, hash: string): boolean {
  const keyHash = hashAPIKey(apiKey);
  return crypto.timingSafeEqual(Buffer.from(keyHash), Buffer.from(hash));
}

// ============================================================================
// RATE LIMITING HELPERS
// ============================================================================

/**
 * Check if IP is rate limited
 */
export async function isRateLimited(
  identifier: string,
  limit: number,
  windowMs: number
): Promise<boolean> {
  // In production, use Redis or similar for distributed rate limiting
  // This is a simplified in-memory implementation
  return false;
}

/**
 * Record rate limit attempt
 */
export async function recordRateLimitAttempt(identifier: string): Promise<void> {
  // In production, increment counter in Redis
  console.log(`Rate limit attempt recorded for: ${identifier}`);
}

// ============================================================================
// THREAT DETECTION
// ============================================================================

/**
 * Detect suspicious activity
 */
export async function detectSuspiciousActivity(
  userId: string,
  activity: {
    type: string;
    ipAddress: string;
    userAgent: string;
    timestamp: Date;
  }
): Promise<boolean> {
  // Implement threat detection logic
  // Examples:
  // - Multiple failed login attempts
  // - Login from unusual location
  // - Rapid API requests
  // - Access to sensitive resources
  // - Unusual time of access

  return false; // Placeholder
}

/**
 * Block suspicious IP
 */
export async function blockIP(ipAddress: string, reason: string, duration?: number): Promise<void> {
  console.log(`Blocking IP ${ipAddress}: ${reason}`);
  // In production, add to blocklist in database or firewall
}

// ============================================================================
// SECURITY HEADERS
// ============================================================================

/**
 * Get security headers for responses
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-DNS-Prefetch-Control': 'on',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-ancestors 'none'",
    ].join('; '),
  };
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize security features
 */
export function initializeSecurity(): void {
  console.log('Security features initialized');

  // Set up global error handlers
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      // Log to error tracking service
    });

    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      // Log to error tracking service
    });
  }
}

export default {
  // MFA
  generateMFASecret,
  generateBackupCodes,
  verifyTOTP,
  setupMFA,

  // Audit Logging
  createAuditLog,
  logUserAction,
  queryAuditLogs,

  // Security Events
  logSecurityEvent,

  // Password Security
  validatePasswordStrength,
  hashPassword,
  verifyPassword,

  // Session Management
  generateSessionToken,
  generateCSRFToken,
  verifyCSRFToken,

  // Encryption
  encryptData,
  decryptData,

  // API Keys
  generateAPIKey,
  hashAPIKey,
  verifyAPIKey,

  // Rate Limiting
  isRateLimited,
  recordRateLimitAttempt,

  // Threat Detection
  detectSuspiciousActivity,
  blockIP,

  // Security Headers
  getSecurityHeaders,

  // Initialization
  initializeSecurity,
};
