"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { revokeAccess } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";

export function RevokeGrantButton({ grantId, userId }: { grantId: string; userId: string }) {
  const router = useRouter();
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={async () => {
        await revokeAccess(grantId, userId);
        toast.success("Grant revoked.");
        router.refresh();
      }}
    >
      Revoke
    </Button>
  );
}
