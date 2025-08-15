'use client';

import { Button } from '@/components/ui/button';
import { updatePassword } from '@/utils/auth-helpers/server';
import { handleRequest } from '@/utils/auth-helpers/client';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/utils/supabase/hooks';

export default function UpdatePasswordForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const queryParams = useSearchParams();
  const error = queryParams.get('error');
  const errorDescription = queryParams.get('error_description');

  useEffect(() => {
    const setupSession = async () => {
      try {
        const accessToken = sessionStorage.getItem('temp_access_token');
        const refreshToken = sessionStorage.getItem('temp_refresh_token');

        if (accessToken && refreshToken) {
          console.log('Setting session from stored tokens');
          const supabase = createClient();

          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error('Session setup error:', error);
          } else {
            console.log('Session set successfully');
          }

          // Clear the temporary tokens regardless of success/failure
          sessionStorage.removeItem('temp_access_token');
          sessionStorage.removeItem('temp_refresh_token');
        }
      } catch (error) {
        console.error('Session setup error:', error);
      }
    };

    // Set up session in background but don't block form rendering
    setupSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsLoading(true);
    await handleRequest(e, updatePassword, router);
    setIsLoading(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1 text-gray-900">
          Set Your Password
        </h2>
        <p className="text-sm text-gray-600">
          Please set a password for your account to continue
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label
            htmlFor="password"
            className="block text-sm font-medium mb-1 text-gray-700"
          >
            New Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your new password"
            required
            name="password"
            autoComplete="new-password"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#EA384C]"
          />
        </div>
        <div>
          <Label
            htmlFor="passwordConfirm"
            className="block text-sm font-medium mb-1 text-gray-700"
          >
            Confirm Password
          </Label>
          <Input
            id="passwordConfirm"
            type="password"
            placeholder="Confirm your new password"
            required
            name="passwordConfirm"
            autoComplete="new-password"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#EA384C]"
          />
        </div>
        {error && <p className="text-red-600 text-xs">{errorDescription}</p>}
        <Button
          type="submit"
          className="w-full bg-[#EA384C] text-white rounded-md py-2 font-semibold transition hover:bg-[#d92d3a] focus:outline-none focus:ring-2 focus:ring-[#EA384C] focus:ring-offset-2"
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
            'Set Password'
          )}
        </Button>
      </form>
      <p className="text-xs text-center mt-4 text-gray-500">
        By continuing, you agree to our{' '}
        <a href="#" className="text-[#EA384C] hover:underline">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="#" className="text-[#EA384C] hover:underline">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
}
