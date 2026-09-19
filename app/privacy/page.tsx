import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { auth } from "@/lib/auth";

export default async function PrivacyPage() {
  const session = await auth();
  return (
    <div className="min-h-full">
      <SiteHeader user={session?.user} />
      <article className="mx-auto max-w-3xl space-y-4 px-4 py-16 text-muted-foreground">
        <h1 className="font-display text-4xl font-semibold text-foreground">Privacy</h1>
        <p>
          MeritPath stores the name, email, onboarding tags, goal logs, purchases,
          and exam answers needed to run the hall. Passwords are hashed. Paid PDFs
          are served only through a short-lived signed URL after an access check.
        </p>
        <p>
          Demo Google signup sends only the name and email you type. Real Google
          OAuth is used only when client keys are configured. We do not sell
          student lists. Admins on this installation can see your grants because
          they operate the catalogue.
        </p>
        <p>
          You can ask an admin to suspend or delete an account. Exam attempts stay
          on the server so ranks and analytics stay honest for the batch.
        </p>
      </article>
      <SiteFooter />
    </div>
  );
}
