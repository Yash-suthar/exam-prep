import Link from "next/link";
import { loginUser } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth/auth-form";
import { GoogleAuthForm } from "@/components/auth/google-auth-form";
import { Logo } from "@/components/layout/logo";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-sm">
        <Logo className="mb-6" />
        <h1 className="font-display text-3xl font-semibold">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Student: student@meritpath.in / MeritPath@Student1
          <br />
          Admin opens the console: admin@meritpath.in / MeritPath@Admin1
        </p>
        <AuthForm
          action={loginUser}
          submitLabel="Log in"
          callbackUrl={callbackUrl}
        />
        <GoogleAuthForm />
        <p className="mt-6 text-sm text-muted-foreground">
          New here?{" "}
          <Link href="/register" className="font-semibold text-primary">
            Create an account
          </Link>
          {" · "}
          <Link href="/forgot-password" className="font-semibold text-primary">
            Forgot password
          </Link>
        </p>
      </div>
    </div>
  );
}
