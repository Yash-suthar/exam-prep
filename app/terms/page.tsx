import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { auth } from "@/lib/auth";

export default async function TermsPage() {
  const session = await auth();
  return (
    <div className="min-h-full">
      <SiteHeader user={session?.user} />
      <article className="mx-auto max-w-3xl space-y-4 px-4 py-16 text-muted-foreground">
        <h1 className="font-display text-4xl font-semibold text-foreground">Terms</h1>
        <p>
          MeritPath is an exam-prep product. Mocks are practice papers. They are
          not affiliated with SSC, IBPS, NTA, CBSE, or any official board. Rank
          and percentile are computed from attempts on this installation only.
        </p>
        <p>
          A filled bubble cannot be changed. Auto-submit at zero is final.
          Purchases and admin grants control library access. Demo checkout does
          not move money. Refunds on live Razorpay charges follow the payment
          provider and the admin of this instance.
        </p>
        <p>
          Do not share answer keys, signed PDF links, or another student&apos;s
          login. Admins may suspend accounts that leak paid papers.
        </p>
      </article>
      <SiteFooter />
    </div>
  );
}
