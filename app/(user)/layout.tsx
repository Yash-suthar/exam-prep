import { AppShell } from "@/components/layout/app-shell";
import { getInProgressExam } from "@/lib/in-progress";
import { requireReadyStudent } from "@/lib/onboarding-gate";
import { requireUser } from "@/lib/session";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  await requireReadyStudent(user.id, user.role);
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
