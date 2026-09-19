import { AppShell } from "@/components/layout/app-shell";
import { requireAdmin } from "@/lib/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return <AppShell role="ADMIN">{children}</AppShell>;
}
