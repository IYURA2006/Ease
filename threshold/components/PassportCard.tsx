"use client";

import type { PassportRecord } from "@/lib/types";
import { PassportCardInner } from "./PassportCardInner";

interface PassportCardProps {
  record: PassportRecord;
  qrCode?: string | null;
  showActions?: boolean;
}

export function PassportCard({
  record,
  qrCode = null,
  showActions = true,
}: PassportCardProps) {
  return (
    <PassportCardInner
      record={record}
      qrCode={qrCode ?? undefined}
      showActions={showActions}
    />
  );
}
