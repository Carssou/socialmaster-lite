import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { registerSchema, RegisterFormData } from '../utils/validation';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';

export const Register: React.FC = () => {
  const { register: registerUser, isAuthenticated } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });
  
  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      // AuthContext will handle redirect via Navigate component above
    } catch (err: any) {
      setError('root', {
        type: 'manual',
        message: err.message || 'Registration failed',
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
          <p className="mt-2 text-gray-600">Join thousands of creators</p>
        </div>
        
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create your account</CardTitle>
            <CardDescription>
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-500 hover:text-primary-600 transition-colors"
              >
                Sign in here
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
                  id="name"
                  type="text"
                  label="Full Name"
                  placeholder="Enter your full name"
                  autoComplete="name"
                  error={errors.name?.message}
                  {...register('name')}
                />
                
                <Input
                  id="email"
                  type="email"
                  label="Email Address"
                  placeholder="Enter your email"
                  autoComplete="email"
                  error={errors.email?.message}
                  {...register('email')}
                />
                
                <Input
                  id="password"
                  type="password"
                  label="Password"
                  placeholder="Create a password"
                  autoComplete="new-password"
                  error={errors.password?.message}
                  helperText="Must be 8+ characters with uppercase, lowercase, number, and special character"
                  {...register('password')}
                />
                
                <Input
                  id="confirmPassword"
                  type="password"
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={isSubmitting}
              >
                {isSubmitting ? 'Creating account...' : 'Create account'}
              </Button>
              
              <div className="bg-primary-50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <CheckIcon className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-primary-900">Manual Approval Required</p>
                    <p className="text-sm text-primary-700 mt-1">
                      New accounts require administrator approval for security. You'll receive an email once your account is activated.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  By creating an account, you agree to our{' '}
                  <a href="#" className="text-primary-500 hover:text-primary-600">terms of service</a>
                  {' '}and{' '}
                  <a href="#" className="text-primary-500 hover:text-primary-600">privacy policy</a>.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <p className="mt-8 text-center text-sm text-gray-500">
          🔒 Your data is encrypted and secure
        </p>
      </div>
    </div>
  );
};