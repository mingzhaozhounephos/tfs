'use client';

import { cn } from '@/utils/cn';
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
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SignIn } from '@/utils/auth-helpers/server';

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await SignIn(email, password);
      if (error) throw error;
      // Update this route to redirect to an authenticated route. The user already has an active session.
      router.push('/');
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred');
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
              Welcome to the TFS
              <br />
              Driver Portal
            </h1>
            <p className="text-base text-white/80 mb-6">
              Access training videos, documentation, and resources all in one
              place.
            </p>
            <div className="bg-[#f75a68] bg-opacity-90 rounded-xl p-6 mt-8 shadow-inner">
              <h2 className="text-lg font-semibold mb-2">
                Why use Driver Hub?
              </h2>
              <ul className="text-sm space-y-2 list-disc list-inside text-white/80">
                <li>Access all training materials in one place</li>
                <li>Stay up-to-date with company policies</li>
                <li>Complete required training at your own pace</li>
                <li>Access resources on the go from any device</li>
              </ul>
            </div>
          </div>
        </div>
        {/* Right Panel */}
        <div className="flex flex-1 flex-col justify-center items-center bg-white py-12 px-6">
          <div className="w-full max-w-md">
            <div className="bg-white border border-gray-200 rounded-xl shadow p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-1 text-gray-900">
                  Login to TFS Driver Hub
                </h2>
                <p className="text-sm text-gray-600">
                  Enter your credentials to access your account
                </p>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-1 text-gray-700"
                  >
                    Username
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#EA384C]"
                    placeholder="Enter your username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium mb-1 text-gray-700"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#EA384C]"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {error && <p className="text-red-600 text-xs">{error}</p>}
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
                      Processing
                    </span>
                  ) : (
                    'Login'
                  )}
                </button>
              </form>
              <p className="text-sm text-center mt-4">
                <Link
                  href="/auth/sign-up"
                  className="text-[#EA384C] hover:underline"
                >
                  Don&apos;t have an account? Register
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
