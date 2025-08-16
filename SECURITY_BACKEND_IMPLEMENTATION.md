# Security Backend Implementation Issue

## Overview
The Settings page Security tab UI has been implemented with modern components and forms, but requires backend API endpoints and functionality to be fully operational.

## Required Backend Implementations

### 1. Password Change API Endpoint

**Endpoint:** `PUT /api/auth/change-password`

**Request Body:**
```typescript
interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
```

**Response:**
```typescript
interface ChangePasswordResponse {
  success: boolean;
  message: string;
}
```

**Implementation Requirements:**
- Verify current password against stored hash
- Validate new password meets security requirements (min 8 chars, complexity)
- Hash new password with bcrypt
- Update user password in database
- Invalidate all existing sessions/tokens (optional security measure)
- Return appropriate error messages for validation failures

**Security Considerations:**
- Rate limiting (max 5 attempts per hour)
- Password strength validation
- Secure password hashing (bcrypt with salt rounds >= 12)
- Log password change events for audit trail

### 2. Two-Factor Authentication (2FA) Implementation

#### 2.1 Enable 2FA Endpoint
**Endpoint:** `POST /api/auth/2fa/enable`

**Response:**
```typescript
interface Enable2FAResponse {
  success: boolean;
  secret: string;        // Base32 encoded secret
  qrCodeUrl: string;     // QR code data URL for authenticator apps
  backupCodes: string[]; // Recovery codes
}
```

#### 2.2 Verify 2FA Setup Endpoint
**Endpoint:** `POST /api/auth/2fa/verify-setup`

**Request Body:**
```typescript
interface Verify2FASetupRequest {
  token: string; // 6-digit code from authenticator app
}
```

#### 2.3 Disable 2FA Endpoint
**Endpoint:** `POST /api/auth/2fa/disable`

**Request Body:**
```typescript
interface Disable2FARequest {
  password: string; // User's current password for verification
  token: string;    // 6-digit code from authenticator app
}
```

#### 2.4 Generate Recovery Codes Endpoint
**Endpoint:** `POST /api/auth/2fa/regenerate-codes`

**Response:**
```typescript
interface RegenerateCodesResponse {
  success: boolean;
  backupCodes: string[];
}
```

### 3. Database Schema Updates

#### 3.1 Users Table Additions
```sql
ALTER TABLE users ADD COLUMN two_factor_secret VARCHAR(32);
ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN two_factor_backup_codes TEXT[]; -- Array of hashed backup codes
ALTER TABLE users ADD COLUMN password_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
```

#### 3.2 Security Events Table (Optional)
```sql
CREATE TABLE security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- 'password_change', '2fa_enabled', '2fa_disabled', etc.
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Frontend Integration Points

#### 4.1 API Client Updates
Add methods to `src/services/api.ts`:
```typescript
// Password change
async changePassword(data: ChangePasswordRequest): Promise<ChangePasswordResponse>

// 2FA management
async enable2FA(): Promise<Enable2FAResponse>
async verify2FASetup(token: string): Promise<ApiResponse>
async disable2FA(password: string, token: string): Promise<ApiResponse>
async regenerateBackupCodes(): Promise<RegenerateCodesResponse>
```

#### 4.2 Settings Page Updates
The UI is already implemented in `/frontend/src/pages/Settings.tsx` but needs:
- Connect password form to actual API endpoint
- Implement 2FA enable/disable functionality
- Add QR code display for 2FA setup
- Show backup codes after 2FA setup
- Add proper error handling and success states

### 5. Security Libraries Required

#### Backend Dependencies
```json
{
  "speakeasy": "^2.0.0",     // TOTP generation and verification
  "qrcode": "^1.5.3",       // QR code generation
  "bcrypt": "^5.1.0",       // Password hashing (already installed)
  "crypto": "built-in"      // Random code generation
}
```

#### Frontend Dependencies (if needed)
```json
{
  "qrcode-generator": "^1.4.4" // Client-side QR display (optional)
}
```

### 6. Implementation Priority

1. **High Priority:** Password change functionality
   - Essential security feature
   - Relatively simple implementation
   - High user demand

2. **Medium Priority:** 2FA enable/disable
   - Enhanced security feature
   - More complex implementation
   - Good for security compliance

3. **Low Priority:** Security event logging
   - Audit trail for compliance
   - Can be added incrementally

### 7. Testing Requirements

#### Backend Tests
- Password change validation and hashing
- 2FA secret generation and verification
- Database operations and migrations
- Error handling and edge cases

#### Frontend Tests
- Form validation and submission
- 2FA setup flow
- Error message display
- State management during operations

### 8. Security Considerations

- **Rate Limiting:** Implement rate limiting on all security endpoints
- **Input Validation:** Validate all inputs server-side
- **Audit Logging:** Log all security-related events
- **Session Management:** Consider session invalidation after password changes
- **Backup Codes:** Securely generate and store recovery codes
- **HTTPS Only:** Ensure all security endpoints are HTTPS-only

## Estimated Implementation Time

- Password Change API: 2-3 hours
- 2FA Implementation: 6-8 hours
- Database Migrations: 1 hour
- Testing: 3-4 hours
- **Total: 12-16 hours**

## Notes

- The UI components are already styled with the modern design system
- Frontend validation is in place, backend validation still needed
- Consider implementing progressive enhancement (password change first, 2FA later)
- All security features should be thoroughly tested before deployment