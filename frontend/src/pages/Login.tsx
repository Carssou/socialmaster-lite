import React from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { loginSchema, LoginFormData } from '../utils/validation';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';

export const Login: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const location = useLocation();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });
  
  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      // AuthContext will handle redirect via Navigate component above
    } catch (err: any) {
      setError('root', {
        type: 'manual',
        message: err.message || 'Login failed',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Back to home link */}
      <div className="absolute top-8 left-8">
        <Link 
          to="/" 
          className="inline-flex items-center text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to home
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Social Master Lite</h1>
          <p className="mt-2 text-gray-600">Welcome back</p>
        </div>
        
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sign in to your account</CardTitle>
            <CardDescription>
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-primary-500 hover:text-primary-600 transition-colors"
              >
                Create one here
              </Link>
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {errors.root && (
                <div className="rounded-lg bg-error-50 border border-error-200 p-4">
                  <div className="text-sm text-error-700">{errors.root.message}</div>
                </div>
              )}
              
              <div className="space-y-4">
                <Input
                  id="email"
                  type="email"
                  label="Email address"
                  placeholder="Enter your email"
                  autoComplete="email"
                  error={errors.email?.message}
                  {...register('email')}
                />
                
                <Input
                  id="password"
                  type="password"
                  label="Password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  error={errors.password?.message}
                  {...register('password')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-primary-500 hover:text-primary-600 transition-colors"
                  >
                    Forgot your password?
                  </a>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={isSubmitting}
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <p className="mt-8 text-center text-sm text-gray-500">
          Secure sign-in with enterprise-grade encryption
        </p>
      </div>
    </div>
  );
};