"use client";

import { Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * "PDF ডাউনলোড করুন" and "প্রিন্ট করুন" both open the browser's native print
 * dialog, which offers "Save as PDF" as a destination — a real vector/text
 * PDF, not a rasterized screenshot, with zero extra dependencies.
 */
export function PrintButton({
  label = "প্রিন্ট করুন",
  variant = "secondary",
  icon = "print",
}: {
  label?: string;
  variant?: "primary" | "secondary" | "ghost";
  icon?: "print" | "download";
}) {
  const Icon = icon === "download" ? Download : Printer;
  return (
    <Button type="button" variant={variant} onClick={() => window.print()}>
      <Icon className="h-4 w-4" />
      {label}
    </Button>
  );
}
