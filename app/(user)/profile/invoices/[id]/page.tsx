import Link from "next/link";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/profile/print-button";
import { Button } from "@/components/ui/button";
import { invoiceNumber, purchaseLabel, resolveItemTitle } from "@/lib/catalog-titles";
import { formatInr } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const purchase = await prisma.purchase.findFirst({
    where: { id, userId: user.id },
  });
  if (!purchase) notFound();

  const title = await resolveItemTitle(purchase.itemType, purchase.itemId);
  const number = invoiceNumber(purchase.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-16">
      <div className="flex items-center justify-between print:hidden">
        <Button asChild variant="outline" size="sm">
          <Link href="/profile">Back to profile</Link>
        </Button>
        <PrintButton />
      </div>
      <InvoicePrint
        number={number}
        buyerName={user.name ?? "Student"}
        buyerEmail={user.email ?? ""}
        title={purchaseLabel(purchase.itemType, title)}
        amount={purchase.amount}
        status={purchase.status}
        createdAt={purchase.createdAt}
        expiresAt={purchase.expiresAt}
      />
    </div>
  );
}

function InvoicePrint({
  number,
  buyerName,
  buyerEmail,
  title,
  amount,
  status,
  createdAt,
  expiresAt,
}: {
  number: string;
  buyerName: string;
  buyerEmail: string;
  title: string;
  amount: number;
  status: string;
  createdAt: Date;
  expiresAt: Date | null;
}) {
  return (
    <article className="rounded-3xl border border-border bg-card p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-2xl font-semibold">MeritPath</p>
          <p className="text-sm text-muted-foreground">Exam-prep hall · India</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Receipt</p>
          <p className="font-semibold">{number}</p>
        </div>
      </div>
      <dl className="mt-8 grid gap-3 text-sm">
        <Row label="Billed to" value={`${buyerName} · ${buyerEmail}`} />
        <Row label="Item" value={title} />
        <Row label="Amount" value={formatInr(amount)} />
        <Row label="Status" value={status} />
        <Row label="Date" value={createdAt.toDateString()} />
        <Row
          label="Access"
          value={expiresAt ? `Until ${expiresAt.toDateString()}` : "Lifetime"}
        />
      </dl>
      <p className="mt-8 text-xs text-muted-foreground">
        Demo GSTIN 24AAMPM1234K1Z5. This receipt is issued by this MeritPath
        installation. Live Razorpay charges will show the provider reference
        when keys are configured.
      </p>
    </article>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
