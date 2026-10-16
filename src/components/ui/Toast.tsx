"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { Bell, CheckCircle2, XCircle, X } from "lucide-react";

type ToastKind = "success" | "error";

type Toast = {
  id: number;
  kind: ToastKind;
  message: string;
};

type Notification = {
  id: number;
  title: string;
  message: string;
  href?: string;
};

type ToastContextValue = {
  showToast: (kind: ToastKind, message: string) => void;
  notify: (input: { title: string; message: string; href?: string }) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const idRef = useRef(0);

  const showToast = useCallback((kind: ToastKind, message: string) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, kind, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const notify = useCallback((input: { title: string; message: string; href?: string }) => {
    const id = ++idRef.current;
    setNotifications((prev) => [...prev, { id, ...input }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 8000);
  }, []);

  const value = useMemo(() => ({ showToast, notify }), [showToast, notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6"
      >
        {notifications.map((n) => {
          const content = (
            <>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-50 text-accent-600">
                <Bell className="h-4.5 w-4.5" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink">{n.title}</p>
                <p className="mt-0.5 text-sm text-ink-soft">{n.message}</p>
              </div>
            </>
          );

          return (
            <div
              key={n.id}
              role="status"
              className="animate-slide-up pointer-events-auto flex items-start gap-3 rounded-xl border border-accent-100 bg-surface p-4 shadow-lg"
            >
              {n.href ? (
                <Link href={n.href} className="flex flex-1 items-start gap-3">
                  {content}
                </Link>
              ) : (
                <div className="flex flex-1 items-start gap-3">{content}</div>
              )}
              <button
                type="button"
                aria-label="বন্ধ করুন"
                onClick={() => setNotifications((prev) => prev.filter((x) => x.id !== n.id))}
                className="text-ink-faint hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}

        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`animate-slide-up pointer-events-auto flex items-start gap-3 rounded-lg border bg-surface px-4 py-3 shadow-lg ${
              t.kind === "success" ? "border-primary-100" : "border-accent-100"
            }`}
          >
            {t.kind === "success" ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
            ) : (
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
            )}
            <p className="flex-1 text-sm text-ink">{t.message}</p>
            <button
              type="button"
              aria-label="বন্ধ করুন"
              onClick={() =>
                setToasts((prev) => prev.filter((x) => x.id !== t.id))
              }
              className="text-ink-faint hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
