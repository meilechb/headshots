"use client";

import { useEffect } from "react";
import { markMessagesRead } from "@/app/admin/actions";

/** Opening a client's page clears their "new message" marker. */
export function MarkRead({ clientId }: { clientId: string }) {
  useEffect(() => {
    void markMessagesRead(clientId);
  }, [clientId]);
  return null;
}
