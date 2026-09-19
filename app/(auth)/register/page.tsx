import Link from "next/link";
import { registerUser } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth/auth-form";
import { GoogleAuthForm } from "@/components/auth/google-auth-form";
import { Logo } from "@/components/layout/logo";

export default function RegisterPage() {
  return (
    <div className="flex min-h-full items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <Logo />
          <span className="text-xs font-semibold text-primary">Step 1 of 5</span>
        </div>
        <h1 className="font-display text-3xl font-semibold">How do you want to start?</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Email and password, or continue with Google. We ask who you are next — never on this screen.
        </p>
        <AuthForm action={registerUser} submitLabel="Create account" withName />
        <div className="relative my-5 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span className="bg-card px-2">or</span>
        </div>
        <GoogleAuthForm />
        <p className="mt-6 text-sm text-muted-foreground">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-primary">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
