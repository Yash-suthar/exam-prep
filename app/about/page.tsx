import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { auth } from "@/lib/auth";

export default async function AboutPage() {
  const session = await auth();
  return (
    <div className="min-h-full">
      <SiteHeader user={session?.user} />
      <article className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">About</p>
        <h1 className="mt-2 font-display text-4xl font-semibold">
          A mock hall, not another PDF dump
        </h1>
        <div className="mt-6 space-y-4 text-muted-foreground">
          <p>
            MeritPath is built for students who will sit an OMR or a computer-based
            paper this year. The product copies the constraints of that hall:
            a real question paper, a bubble sheet that does not forgive, and a
            score that is recomputed from the key.
          </p>
          <p>
            After signup you say whether you are in school, a graduate, or working,
            then tag SSC, banking, JEE, NEET, boards, or a state exam. Notices,
            free trials, and recommendations follow those tags. A Goal page
            tracks the daily list — one mock, forty-five minutes of reading,
            twenty formulae — and ranks you against peers on the same exam.
          </p>
          <p>
            Coaching admins publish books, papers, and mocks, pin notices to a
            batch, and grant or revoke a single title. Payments use Razorpay when
            keys exist; otherwise checkout is a local demo so the hall still
            works offline.
          </p>
        </div>
      </article>
      <SiteFooter />
    </div>
  );
}
