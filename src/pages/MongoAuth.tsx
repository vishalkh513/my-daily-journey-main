import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PasswordInput } from '@/components/PasswordInput';
import { LogOut } from 'lucide-react';
import { authService } from '@/services/authService';
import { toast } from 'sonner';

// Shared validation schema
const validationSchema = z.object({
  email: z.string().trim().email('Enter a valid email').max(255),
  username: z.string().min(3, 'Username must be at least 3 characters').max(50),
  password: z.string().min(6, 'Password must be at least 6 characters').max(72),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const MongoAuthPage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate based on mode
    if (mode === 'signin') {
      // Validate signin
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.trim()) {
        toast.error('Email is required');
        return;
      }
      if (!emailRegex.test(email)) {
        toast.error('Enter a valid email');
        return;
      }
      if (!password || password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
    } else if (mode === 'forgot') {
      // Validate forgot password
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.trim()) {
        toast.error('Email is required');
        return;
      }
      if (!emailRegex.test(email)) {
        toast.error('Enter a valid email');
        return;
      }
      if (!newPassword || newPassword.length < 6) {
        toast.error('New password must be at least 6 characters');
        return;
      }
    } else {
      // Validate signup
      const parsed = validationSchema.safeParse({
        email,
        username,
        password,
        confirmPassword,
      });

      if (!parsed.success) {
        toast.error(parsed.error.issues[0].message);
        return;
      }
    }

    setLoading(true);

    try {
      let user;
      if (mode === 'signin') {
        user = await authService.signin({ email, password });
      } else if (mode === 'forgot') {
        user = await authService.resetPassword({ email, newPassword });
      } else {
        user = await authService.signup({
          email,
          username,
          password,
          confirmPassword,
        });
      }

      if (user) {
        // Clear form and navigate
        setEmail('');
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setNewPassword('');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Daily Journey</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              authService.logout();
              navigate('/mongo-auth');
            }}
            className="text-gray-300 hover:text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="flex items-center justify-center flex-1 p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">
              {mode === 'signin' ? 'Sign In' : mode === 'forgot' ? 'Reset Password' : 'Create Account'}
            </CardTitle>
            <CardDescription>
              {mode === 'signin'
                ? 'Sign in to your account'
                : mode === 'forgot'
                ? 'Enter your email and new password'
                : 'Create a new account to get started'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="email"
                  required
                />
              </div>

              {/* Username Field (Sign Up Only) */}
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                    autoComplete="username"
                    required
                  />
                </div>
              )}

              {/* Password Field */}
              {mode !== 'forgot' && (
                <PasswordInput
                  id="password"
                  label="Password"
                  value={password}
                  onChange={setPassword}
                  placeholder="Enter your password"
                  disabled={loading}
                />
              )}

              {/* New Password Field (Forgot Password Only) */}
              {mode === 'forgot' && (
                <PasswordInput
                  id="newPassword"
                  label="New Password"
                  value={newPassword}
                  onChange={setNewPassword}
                  placeholder="Enter your new password"
                  disabled={loading}
                />
              )}

              {/* Confirm Password Field (Sign Up Only) */}
              {mode === 'signup' && (
                <PasswordInput
                  id="confirmPassword"
                  label="Confirm Password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="Confirm your password"
                  disabled={loading}
                />
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
                size="lg"
              >
                {loading
                  ? mode === 'signin'
                    ? 'Signing in...'
                    : mode === 'forgot'
                    ? 'Resetting...'
                    : 'Creating account...'
                  : mode === 'signin'
                    ? 'Sign In'
                    : mode === 'forgot'
                    ? 'Reset Password'
                    : 'Create Account'}
              </Button>

              {/* Forgot Password Link (Sign In Only) */}
              {mode === 'signin' && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setUsername('');
                      setPassword('');
                      setConfirmPassword('');
                      setNewPassword('');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                    disabled={loading}
                  >
                    Forgot your password?
                  </button>
                </div>
              )}

              {/* Mode Toggle */}
              <div className="text-center text-sm">
                {mode === 'forgot' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setUsername('');
                      setPassword('');
                      setConfirmPassword('');
                      setNewPassword('');
                    }}
                    className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    disabled={loading}
                  >
                    Back to Sign In
                  </button>
                ) : (
                  <>
                    <span className="text-gray-600">
                      {mode === 'signin'
                        ? "Don't have an account? "
                        : 'Already have an account? '}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setMode(mode === 'signin' ? 'signup' : 'signin');
                        setEmail('');
                        setUsername('');
                        setPassword('');
                        setConfirmPassword('');
                        setNewPassword('');
                      }}
                      className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                      disabled={loading}
                    >
                      {mode === 'signin' ? 'Sign Up' : 'Sign In'}
                    </button>
                  </>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MongoAuthPage;
