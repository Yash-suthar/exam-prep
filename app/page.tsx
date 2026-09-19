import Link from "next/link";
import { auth } from "@/lib/auth";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const tracks = [
  { name: "SSC CGL / CHSL", detail: "Tier-1 OMR, −0.50, 100-question stamina later" },
  { name: "Banking prelims", detail: "IBPS / SBI speed, sectional timing habits" },
  { name: "JEE Main", detail: "Class 11–12 notes plus lock-once accuracy" },
  { name: "NEET UG", detail: "Biology-first free trials, NCERT drill" },
  { name: "Class 10 / 12 boards", detail: "Target 90% with a daily checklist" },
  { name: "State PSC / UPSC", detail: "GS papers and notice-board dates" },
];

const stories = [
  {
    name: "Priya Shah",
    exam: "SSC CGL",
    quote:
      "I stopped second-guessing bubbles. The lock matches the real hall, so my mock rank finally means something.",
  },
  {
    name: "Rohan Mehta",
    exam: "Class 12 boards",
    quote:
      "The goal page is the only streak I have kept. Forty-five minutes and ten questions, every weekday.",
  },
  {
    name: "Ananya Rao",
    exam: "Coaching admin",
    quote:
      "I publish a paper, pin a notice to graduates, and grant a trial to one batch. Students see only their track.",
  },
];

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="min-h-full">
      <SiteHeader user={session?.user} />
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-16">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            India&apos;s lock-once mock hall
          </p>
          <h1 className="mt-3 max-w-xl font-display text-4xl leading-[1.05] font-semibold tracking-tight sm:text-5xl">
            Sit the paper. Fill the OMR. Live with the mark.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            MeritPath is a Testbook-style hall for SSC, banking, boards, JEE, and
            NEET. The PDF stays on the left. The bubble sheet locks like a
            government OMR. The server, not your phone, computes negative marking.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href={session?.user ? "/dashboard" : "/register"}>
                {session?.user ? "Continue preparing" : "Create free account"}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Open the demo hall</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            student@meritpath.in · MeritPath@Student1 — SSC goal, past mocks, invoices
          </p>
        </div>
        <Card className="overflow-hidden">
          <CardHeader>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Live OMR preview
            </p>
            <CardTitle>SSC CGL Tier-1 mock — Set A</CardTitle>
            <p className="text-sm text-muted-foreground">
              20 questions · 15 minutes · +2 / −0.50 · rank among the hall
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
                          : question === 4 && option === "A"
                            ? "border-violet-600 bg-violet-600"
                            : "border-foreground/40"
                      }`}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-ink" /> Locked
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-violet-600" /> Marked
              </span>
              <span>Grey = not visited · Red after you open and skip</span>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="grid gap-3 rounded-3xl border border-border bg-card p-5 sm:grid-cols-3">
          {[
            ["4,200+", "demo attempts scored on the server"],
            ["−0.25 / −0.50", "negative marking you can trust"],
            ["1–2 notices", "only the alerts that match your tags"],
          ].map(([stat, label]) => (
            <div key={label} className="px-2 py-1">
              <p className="font-display text-2xl font-semibold">{stat}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="font-display text-3xl font-semibold">Pick a track</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Signup asks who you are, which class you sit, and which exams you
          chase. Catalog, notices, and free trials follow those tags.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tracks.map((track) => (
            <Card key={track.name}>
              <CardHeader>
                <CardTitle className="text-lg">{track.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {track.detail}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="rounded-3xl border border-primary/30 bg-primary/5 p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            The part nobody else does properly
          </p>
          <h2 className="mt-2 max-w-2xl font-display text-3xl font-semibold">
            A goal that actually knows your syllabus
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Pick SSC and you get the real SSC syllabus loaded — Quant, Reasoning,
            English, GA, every topic. Move each topic from Not started to Mastered,
            log study minutes with the built-in timer, and watch one number tell you
            whether you will be ready on exam day.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Readiness score", "Syllabus coverage, mock accuracy, weekly minutes, and streak in one number."],
              ["Study timer", "Start it, pick a topic, and the minutes land on your week and your topic history."],
              ["Rest days", "Mark Sunday as rest. Your streak survives the day you planned to skip."],
              ["Required pace", "“2 topics a day” — computed from what is left and how many days remain."],
            ].map(([title, body]) => (
              <div key={title} className="rounded-2xl bg-card p-4">
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-16 md:grid-cols-3">
        {[
          {
            title: "1. Read the paper",
            body: "The official-style PDF stays in view. Phones keep the paper full-screen and dock the bubbles.",
          },
          {
            title: "2. Fill once",
            body: "A confirmation can sit in front of the lock. After that the bubble is ink. Mark for review if you want a second look.",
          },
          {
            title: "3. See the hall rank",
            body: "Score, accuracy, percentile, and topic misses — computed from the answer key on the server.",
          },
        ].map((step) => (
          <Card key={step.title}>
            <CardHeader>
              <CardTitle>{step.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {step.body}
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="font-display text-3xl font-semibold">From the hall</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {stories.map((story) => (
            <Card key={story.name}>
              <CardHeader>
                <CardTitle className="text-lg">{story.name}</CardTitle>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {story.exam}
                </p>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                “{story.quote}”
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <Card>
          <CardHeader>
            <CardTitle>Plans</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-muted/70 p-5">
              <p className="text-sm font-semibold">Single title</p>
              <p className="mt-1 font-display text-3xl">From ₹49</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Unlock one book, material, previous paper, or paid mock. Demo
                checkout is instant when payment keys are empty.
              </p>
            </div>
            <div className="rounded-2xl bg-primary p-5 text-primary-foreground">
              <p className="text-sm font-semibold">Full Access — 3 months</p>
              <p className="mt-1 font-display text-3xl">₹999</p>
              <p className="mt-2 text-sm text-primary-foreground/80">
                Library + new mocks published during the window. Admins can
                still grant a single title or a trial.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
      <SiteFooter />
    </div>
  );
}
