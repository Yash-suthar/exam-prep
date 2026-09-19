import Link from "next/link";
import { auth } from "@/lib/auth";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="min-h-full">
      <SiteHeader user={session?.user} />
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Exam hall, on a laptop
          </p>
          <h1 className="mt-3 max-w-xl font-display text-5xl leading-[1.05] font-semibold tracking-tight">
            Timed mocks with a real OMR sheet next to the paper.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            MeritPath is built for SSC, banking, and state exams. Read the
            question paper PDF, fill bubbles once, and get a server-scored
            result with negative marking.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/register">Create free account</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Use the demo student</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Demo student: student@meritpath.in / MeritPath@Student1
          </p>
        </div>
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>SSC CGL Tier-1 mock</CardTitle>
            <p className="text-sm text-muted-foreground">
              20 questions · 15 minutes · −0.5 wrong
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-[2rem_repeat(4,2rem)] gap-2 text-center text-xs font-bold">
              <span />
              {["A", "B", "C", "D"].map((label) => (
                <span key={label}>{label}</span>
              ))}
              {[1, 2, 3, 4, 5].map((question) => (
                <div key={question} className="contents">
                  <span className="self-center">{question}</span>
                  {["A", "B", "C", "D"].map((option) => (
                    <span
                      key={option}
                      className={`mx-auto h-7 w-7 rounded-full border-2 ${
                        question === 2 && option === "C"
                          ? "border-ink bg-ink"
                          : "border-foreground/40"
                      }`}
                    />
                  ))}
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Once a bubble is filled, it stays filled. That is the point.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-16 md:grid-cols-3">
        {[
          {
            title: "Split-screen paper + OMR",
            body: "PDF on the left, bubble sheet on the right. Phones get a Paper / OMR tab switch.",
          },
          {
            title: "Negative marking you can trust",
            body: "Scores are recomputed on the server from the answer key. The client never decides your marks.",
          },
          {
            title: "Library, notices, and grants",
            body: "Browse books and papers before you buy. Admins can grant a single title or a full-access plan.",
          },
        ].map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {feature.body}
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <Card>
          <CardHeader>
            <CardTitle>Plans</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-muted/70 p-5">
              <p className="text-sm font-semibold">Single paper</p>
              <p className="mt-1 font-display text-3xl">From ₹49</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Buy one book, material, or mock when you need it.
              </p>
            </div>
            <div className="rounded-2xl bg-primary p-5 text-primary-foreground">
              <p className="text-sm font-semibold">Full Access — 3 months</p>
              <p className="mt-1 font-display text-3xl">₹999</p>
              <p className="mt-2 text-sm text-primary-foreground/80">
                Everything in the catalog, including new mocks added during the
                window.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
