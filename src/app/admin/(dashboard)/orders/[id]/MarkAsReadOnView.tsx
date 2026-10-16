"use client";

import { useEffect, useRef } from "react";
import { markOrderRead } from "../actions";

export function MarkAsReadOnView({ orderId, isRead }: { orderId: string; isRead: boolean }) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (isRead || firedRef.current) return;
    firedRef.current = true;
    markOrderRead(orderId, true);
  }, [orderId, isRead]);

  return null;
}
