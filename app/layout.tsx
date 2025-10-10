import { Metadata } from 'next';
import Navbar from '@/components/ui/Navbar';
import MainContentWrapper from '@/components/ui/Navbar/MainContentWrapper';
import { Toaster } from '@/components/ui/sonner';
import { PropsWithChildren, Suspense } from 'react';
import { getURL } from '@/utils/helpers';
import { cookies, headers } from 'next/headers';
import Providers from '@/providers/providers';
import 'styles/main.css';
import {
  createClient,
  getCurrentUserQueryResult
} from '@/utils/supabase/server';

const title = 'Decodifi AI Starter';
const description = 'Brought to you by Vercel, Stripe, and Supabase.';

export const metadata: Metadata = {
  metadataBase: new URL(getURL()),
  title: title,
  description: description,
  openGraph: {
    title: title,
    description: description
  }
};

export default async function RootLayout({ children }: PropsWithChildren) {
  const cookieStore = await cookies();
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';

  const theme = cookieStore.get('theme')?.value;
  console.log('using theme', theme);

  const supabase = createClient();
  let userQueryResult;

  try {
    userQueryResult = await getCurrentUserQueryResult(supabase);
  } catch (error) {
    console.error('Error getting user query result:', error);
    // Provide a fallback QueryResult
    userQueryResult = {
      queryKey: 'current_user_fallback',
      data: [],
      tableName: 'users',
      url: '',
      searchParams: {}
    };
  }

  // Check if user is authenticated
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const isAuthenticated = !!user;

  // Routes that should not show the navbar (even when authenticated)
  const hideNavbarRoutes = ['/auth/update-password'];
  const shouldHideNavbar = hideNavbarRoutes.some((route) =>
    pathname.includes(route)
  );

  return (
    <html lang="en" className={theme || 'light'}>
      <Providers userQueryResult={userQueryResult}>
        <body>
          {isAuthenticated && !shouldHideNavbar ? (
            <>
              <Navbar />
              <MainContentWrapper>{children}</MainContentWrapper>
            </>
          ) : (
            // Simple layout for unauthenticated users or specific routes
            <main className="min-h-screen">{children}</main>
          )}
          <Suspense>
            <Toaster />
          </Suspense>
        </body>
      </Providers>
    </html>
  );
}
