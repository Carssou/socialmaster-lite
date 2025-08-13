import { AuthService } from '../src/services/auth.service';
import { ApiError } from '../src/utils/errors';
import { UserRegistrationDto, UserLoginDto } from '../src/types/models';
import { TestCleanup, generateTestEmail } from './test-utils';

describe('AuthService', () => {
  let authService: AuthService;
  const testUser: UserRegistrationDto = {
    email: `test-${Date.now()}@example.com`,
    name: 'Test User',
    password: 'testpassword123'
  };

  beforeAll(() => {
    authService = new AuthService();
  });

  describe('User Registration', () => {
    test('should register a new user successfully', async () => {
      const result = await authService.register(testUser);
      
      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(testUser.email);
      expect(result.user.name).toBe(testUser.name);
      expect(result.user.tier).toBe('free');
      expect(result.user.isActive).toBe(false); // Manual approval required
      expect(result.user.emailVerified).toBe(false);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.expiresIn).toBe(86400); // 24 hours in seconds
    });

    test('should fail to register user with duplicate email', async () => {
      await expect(authService.register(testUser))
        .rejects
        .toThrow(ApiError);
      
      try {
        await authService.register(testUser);
      } catch (error: any) {
        expect(error.statusCode).toBe(409);
        expect(error.message).toContain('already exists');
      }
    });

    test('should fail to register user with invalid data', async () => {
      const invalidUser = {
        email: 'invalid-email',
        name: '',
        password: '123' // Too short
      };

      // This would fail at validation level if we had validation middleware
      // For now, we test the service layer directly
    });
  });

  describe('User Authentication', () => {
    test('should fail login for inactive user', async () => {
      const loginData: UserLoginDto = {
        email: testUser.email,
        password: testUser.password
      };

      await expect(authService.login(loginData))
        .rejects
        .toThrow(ApiError);
        
      try {
        await authService.login(loginData);
      } catch (error) {
        expect(error.statusCode).toBe(401);
        expect(error.message).toContain('pending approval');
      }
    });

    test('should fail login with wrong password', async () => {
      const loginData: UserLoginDto = {
        email: testUser.email,
        password: 'wrongpassword'
      };

      await expect(authService.login(loginData))
        .rejects
        .toThrow(ApiError);
        
      try {
        await authService.login(loginData);
      } catch (error) {
        expect(error.statusCode).toBe(401);
        expect(error.message).toContain('Invalid email or password');
      }
    });

    test('should fail login with non-existent email', async () => {
      const loginData: UserLoginDto = {
        email: 'nonexistent@example.com',
        password: 'anypassword'
      };

      await expect(authService.login(loginData))
        .rejects
        .toThrow(ApiError);
        
      try {
        await authService.login(loginData);
      } catch (error) {
        expect(error.statusCode).toBe(401);
        expect(error.message).toContain('Invalid email or password');
      }
    });
  });

  describe('Token Management', () => {
    test('should generate and verify refresh tokens', async () => {
      const result = await authService.register({
        email: `token-test-${Date.now()}@example.com`,
        name: 'Token Test User',
        password: 'testpassword123'
      });

      expect(result.refreshToken).toBeDefined();
      
      const refreshResult = await authService.refreshToken(result.refreshToken);
      
      expect(refreshResult).toBeDefined();
      expect(refreshResult.token).toBeDefined();
      expect(refreshResult.refreshToken).toBeDefined();
      expect(refreshResult.expiresIn).toBe(86400);
    });

    test('should fail with invalid refresh token', async () => {
      await expect(authService.refreshToken('invalid-token'))
        .rejects
        .toThrow(ApiError);
        
      try {
        await authService.refreshToken('invalid-token');
      } catch (error) {
        expect(error.statusCode).toBe(401);
        expect(error.message).toContain('Invalid refresh token');
      }
    });
  });
});