import { ForgotPasswordForm } from './forgot-password-form';

export default async function Page({
  searchParams
}: {
  searchParams: Promise<{
    error: string;
    error_description: string;
    status: string;
    status_description: string;
  }>;
}) {
  const params = await searchParams;
  return (
    <ForgotPasswordForm
      error={params.error}
      error_description={params.error_description}
      status={params.status}
      status_description={params.status_description}
    />
  );
}
