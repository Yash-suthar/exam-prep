import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Logo } from "@/components/layout/logo";

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-sm">
        <Logo className="mb-6" />
        <h1 className="font-display text-3xl font-semibold">Set a new password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose something you have not used here before.
        </p>
        <ResetPasswordForm token={token} />
        <p className="mt-6 text-sm">
          <Link href="/forgot-password" className="font-semibold text-primary">
            Request a new link
          </Link>
        </p>
      </div>
    </div>
  );
}
