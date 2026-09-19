import { AppShell } from "@/components/layout/app-shell";
import { getInProgressExam } from "@/lib/in-progress";
import { requireUser } from "@/lib/session";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const inProgress = await getInProgressExam(user.id);

  return (
    <AppShell
      role="USER"
      viewerRole={user.role === "ADMIN" ? "ADMIN" : "USER"}
      inProgress={inProgress}
    >
      {children}
    </AppShell>
  );
}
