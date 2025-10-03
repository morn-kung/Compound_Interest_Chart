/**
 * AuthController
 * Handle authentication-related requests
 */

class AuthController extends BaseController {
  constructor() {
    super();
    this.userModel = new UserModel();
  }

  /**
   * Handle user login
   */
  handleLogin(data) {
    try {
      const { username, password } = data;
      
      // Validate required parameters
      const validationResult = this.validateRequiredParams({ username, password }, ['username', 'password']);
      if (!validationResult.isValid) {
        return ApiResponse.validationError(validationResult.message);
      }

      // Authenticate user
      const user = this.userModel.findByUsername(username);
      if (!user || user.password !== password) {
        return ApiResponse.error('Invalid username or password', 401);
      }

      // Create session/token
      const sessionData = {
        username: user.username,
        timestamp: new Date().toISOString(),
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      };

      return ApiResponse.success({
        message: 'Login successful',
        user: {
          username: user.username,
          email: user.email
        },
        session: sessionData
      });

    } catch (error) {
      console.error('Login error:', error);
      return ApiResponse.error('Login failed: ' + error.message);
    }
  }

  /**
   * Handle user registration
   */
  handleRegister(data) {
    try {
      const { username, password, email } = data;
      
      // Validate required parameters
      const validationResult = this.validateRequiredParams({ username, password, email }, ['username', 'password', 'email']);
      if (!validationResult.isValid) {
        return ApiResponse.validationError(validationResult.message);
      }

      // Check if user already exists
      const existingUser = this.userModel.findByUsername(username);
      if (existingUser) {
        return ApiResponse.error('Username already exists', 409);
      }

      // Create new user
      const newUser = {
        username: username,
        password: password,
        email: email,
        created_at: new Date().toISOString(),
        active: true
      };

      const result = this.userModel.addRecord(newUser);
      if (!result.success) {
        return ApiResponse.error('Failed to create user: ' + result.error);
      }

      return ApiResponse.success({
        message: 'User registered successfully',
        user: {
          username: username,
          email: email
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      return ApiResponse.error('Registration failed: ' + error.message);
    }
  }

  /**
   * Handle password reset request
   */
  handleResetPassword(data) {
    try {
      const { username } = data;
      
      // Validate required parameters
      const validationResult = this.validateRequiredParams({ username }, ['username']);
      if (!validationResult.isValid) {
        return ApiResponse.validationError(validationResult.message);
      }

      // Find user
      const user = this.userModel.findByUsername(username);
      if (!user) {
        return ApiResponse.error('User not found', 404);
      }

      // Generate temporary password
      const tempPassword = Math.random().toString(36).slice(-8);
      
      // Update user with temporary password
      const updateResult = this.userModel.setTemporaryPassword(username, tempPassword);
      if (!updateResult.success) {
        return ApiResponse.error('Failed to reset password: ' + updateResult.error);
      }

      // In production, send email with temporary password
      // For now, return it in response (should be removed in production)
      return ApiResponse.success({
        message: 'Password reset successfully',
        tempPassword: tempPassword, // Remove this in production
        note: 'Temporary password sent to registered email'
      });

    } catch (error) {
      console.error('Password reset error:', error);
      return ApiResponse.error('Password reset failed: ' + error.message);
    }
  }

  /**
   * Handle password change
   */
  handleChangePassword(data) {
    try {
      const { username, currentPassword, newPassword } = data;
      
      // Validate required parameters
      const validationResult = this.validateRequiredParams(
        { username, currentPassword, newPassword }, 
        ['username', 'currentPassword', 'newPassword']
      );
      if (!validationResult.isValid) {
        return ApiResponse.validationError(validationResult.message);
      }

      // Authenticate current password
      const user = this.userModel.findByUsername(username);
      if (!user || user.password !== currentPassword) {
        return ApiResponse.error('Current password is incorrect', 401);
      }

      // Update password
      const updateResult = this.userModel.updatePassword(username, newPassword);
      if (!updateResult.success) {
        return ApiResponse.error('Failed to change password: ' + updateResult.error);
      }

      return ApiResponse.success({
        message: 'Password changed successfully'
      });

    } catch (error) {
      console.error('Change password error:', error);
      return ApiResponse.error('Password change failed: ' + error.message);
    }
  }

  /**
   * Handle logout
   */
  handleLogout(data) {
    try {
      const { username } = data;
      
      // In a more complex system, you would invalidate the session/token
      // For now, just return success
      return ApiResponse.success({
        message: 'Logged out successfully'
      });

    } catch (error) {
      console.error('Logout error:', error);
      return ApiResponse.error('Logout failed: ' + error.message);
    }
  }

  /**
   * Verify user session/token
   */
  handleVerifySession(data) {
    try {
      const { username, sessionToken } = data;
      
      // Validate required parameters
      const validationResult = this.validateRequiredParams({ username }, ['username']);
      if (!validationResult.isValid) {
        return ApiResponse.validationError(validationResult.message);
      }

      // Find user
      const user = this.userModel.findByUsername(username);
      if (!user) {
        return ApiResponse.error('User not found', 404);
      }

      // In a more complex system, verify the session token
      // For now, just check if user exists and is active
      if (!user.active) {
        return ApiResponse.error('User account is inactive', 403);
      }

      return ApiResponse.success({
        message: 'Session is valid',
        user: {
          username: user.username,
          email: user.email
        }
      });

    } catch (error) {
      console.error('Session verification error:', error);
      return ApiResponse.error('Session verification failed: ' + error.message);
    }
  }
}