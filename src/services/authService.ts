import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:3000/api/auth';

// Use window for auth state changes

interface SignupParams {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

interface SigninParams {
  email: string;
  password: string;
}

interface ResetPasswordParams {
  email: string;
  newPassword: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
}

interface LocalUser {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

export const authService = {
  /**
   * Sign up with email, username, and password
   */
  async signup(params: SignupParams): Promise<LocalUser | null> {
    try {
      console.log('🔄 Signing up...', params.email);
      
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: params.email,
          username: params.username,
          password: params.password,
          confirmPassword: params.confirmPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        const errorMsg = data.error || 'Failed to create account';
        toast.error(errorMsg);
        return null;
      }

      const data: AuthResponse = await response.json();
      console.log('✅ Signup successful:', data.user);
      
      toast.success('Account created successfully!');

      const user: LocalUser = {
        id: data.user.id,
        email: data.user.email,
        username: data.user.username,
        createdAt: new Date().toISOString(),
      };

      // Save session
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      // Emit auth event to update React state
      window.dispatchEvent(new CustomEvent('auth-change', { detail: user }));
      
      return user;
    } catch (error) {
      console.error('❌ Signup error:', error);
      toast.error('Failed to connect to server. Check if backend is running on port 3000.');
      return null;
    }
  },

  /**
   * Sign in with email and password
   */
  async signin(params: SigninParams): Promise<LocalUser | null> {
    try {
      console.log('🔄 Signing in...', params.email);
      
      const response = await fetch(`${API_BASE_URL}/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: params.email,
          password: params.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        const errorMsg = data.error || 'Invalid email or password';
        toast.error(errorMsg);
        return null;
      }

      const data: AuthResponse = await response.json();
      console.log('✅ Signin successful:', data.user);
      
      toast.success('Signed in successfully!');

      const user: LocalUser = {
        id: data.user.id,
        email: data.user.email,
        username: data.user.username,
        createdAt: new Date().toISOString(),
      };

      // Save session
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      // Emit auth event to update React state
      window.dispatchEvent(new CustomEvent('auth-change', { detail: user }));
      
      return user;
    } catch (error) {
      console.error('❌ Signin error:', error);
      toast.error('Failed to connect to server. Check if backend is running on port 3000.');
      return null;
    }
  },

  /**
   * Reset password
   */
  async resetPassword(params: ResetPasswordParams): Promise<LocalUser | null> {
    try {
      console.log('🔄 Resetting password...', params.email);
      
      const response = await fetch(`${API_BASE_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: params.email,
          newPassword: params.newPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        const errorMsg = data.error || 'Failed to reset password';
        toast.error(errorMsg);
        return null;
      }

      const data: AuthResponse = await response.json();
      console.log('✅ Password reset successful:', data.user);
      
      toast.success('Password reset successfully!');

      const user: LocalUser = {
        id: data.user.id,
        email: data.user.email,
        username: data.user.username,
        createdAt: new Date().toISOString(),
      };

      // Save session
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      // Emit auth event to update React state
      window.dispatchEvent(new CustomEvent('auth-change', { detail: user }));
      
      return user;
    } catch (error) {
      console.error('❌ Password reset error:', error);
      toast.error('Failed to connect to server. Check if backend is running on port 3000.');
      return null;
    }
  },

  /**
   * Sign out and clear session
   */
  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userPassword');
    toast.success('Logged out');
  },

  /**
   * Get current user from session
   */
  getCurrentUser(): LocalUser | null {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  },
};

export type { LocalUser, SignupParams, SigninParams, ResetPasswordParams };
