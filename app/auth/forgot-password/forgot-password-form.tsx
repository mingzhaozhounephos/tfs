'use client';

import { cn } from '@/utils/cn';
import { requestPasswordReset } from '@/utils/auth-helpers/server';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function ForgotPasswordForm({
  className,
  error,
  error_description,
  status,
  status_description,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & {
  error: string;
  error_description: string;
  status: string;
  status_description: string;
}) {
  const [email, setEmail] = useState('');
  const [errorState, setErrorState] = useState<string | null>(error);
  const [success, setSuccess] = useState(!!status);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for URL parameters and update state accordingly
  useEffect(() => {
    const urlStatus = searchParams.get('status');
    const urlError = searchParams.get('error');

    if (urlStatus) {
      setSuccess(true);
    } else if (urlError) {
      setErrorState(urlError);
    }
  }, [searchParams]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorState(null);

    try {
      const formData = new FormData();
      formData.append('email', email);

      const result = await requestPasswordReset(formData);

      // If result is a URL (redirect), navigate to it
      if (typeof result === 'string') {
        router.push(result);
      } else {
        // Should not reach here as the server action always returns a redirect
        setSuccess(true);
      }
    } catch (error: unknown) {
      setErrorState(
        error instanceof Error ? error.message : 'An error occurred'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        'min-h-screen flex items-center justify-center bg-[#f7f8fa] px-2',
        className
      )}
      {...props}
    >
      <div className="flex w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        {/* Left Panel */}
        <div className="hidden md:flex flex-col justify-between bg-[#EA384C] text-white w-1/2 p-10 relative">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-white text-[#EA384C] font-bold rounded-lg px-3 py-2 text-lg shadow-sm">
                TFS
              </div>
              <span className="font-semibold text-xl">Express Logistics</span>
            </div>
            <h1 className="text-3xl font-bold leading-tight mb-2">
              {success ? 'Password Reset' : 'Forgot Your'}
              <br />
              {success ? 'Instructions Sent' : 'Password?'}
            </h1>
            <p className="text-base text-white/80 mb-6">
              {success
                ? 'Check your email for password reset instructions and get back to your training.'
                : "Don't worry, we'll help you get back into your account quickly and securely."}
            </p>
            {!success && (
              <div className="bg-[#f75a68] bg-opacity-90 rounded-xl p-6 mt-8 shadow-inner">
                <h2 className="text-lg font-semibold mb-2">How it works:</h2>
                <ul className="text-sm space-y-2 list-disc list-inside text-white/80">
                  <li>Enter your registered email address</li>
                  <li>We'll send you a secure reset link</li>
                  <li>Click the link to create a new password</li>
                  <li>Return to your training dashboard</li>
                </ul>
              </div>
            )}
          </div>
        </div>
        {/* Right Panel */}
        <div className="flex flex-1 flex-col justify-center items-center bg-white py-12 px-6">
          <div className="w-full max-w-md">
            <div className="bg-white border border-gray-200 rounded-xl shadow p-8">
              {success ? (
                <>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-1 text-gray-900">
                      {status ||
                        searchParams.get('status') ||
                        'Check Your Email'}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {status_description ||
                        searchParams.get('status_description') ||
                        'Password reset instructions sent'}
                    </p>
                  </div>
                  <div className="mb-6">
                    <p className="text-sm text-gray-600">
                      If you registered using your email and password, you will
                      receive a password reset email.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Link
                      href="/auth/login"
                      className="w-full bg-[#EA384C] text-white rounded-md py-2 font-semibold transition hover:bg-[#d92d3a] focus:outline-none focus:ring-2 focus:ring-[#EA384C] focus:ring-offset-2 text-center"
                    >
                      Back to Login
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-1 text-gray-900">
                      Reset Your Password
                    </h2>
                    <p className="text-sm text-gray-600">
                      Enter your email and we'll send you a link to reset your
                      password
                    </p>
                  </div>
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium mb-1 text-gray-700"
                      >
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#EA384C]"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    {errorState && (
                      <p className="text-red-600 text-xs">{errorState}</p>
                    )}
                    {error_description && (
                      <p className="text-red-600 text-xs">
                        {error_description}
                      </p>
                    )}
                    <button
                      type="submit"
                      className="w-full bg-[#EA384C] text-white rounded-md py-2 font-semibold transition hover:bg-[#d92d3a] focus:outline-none focus:ring-2 focus:ring-[#EA384C] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2 justify-center">
                          <svg
                            className="w-4 h-4 animate-spin"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                            ></path>
                          </svg>
                          Sending...
                        </span>
                      ) : (
                        'Send Reset Email'
                      )}
                    </button>
                  </form>
                  <p className="text-sm text-center mt-4">
                    <Link
                      href="/auth/login"
                      className="text-[#EA384C] hover:underline"
                    >
                      Back to Login
                    </Link>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
