"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { portalMobileNav, portalNav } from "@/lib/portal-nav";

export default function PortalShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(
        `/login?redirect=${encodeURIComponent(pathname || "/dashboard")}`
      );
    }
  }, [user, isLoading, router, pathname]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-body-md text-on-surface-variant">Loading portal…</p>
      </div>
    );
  }

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  const Sidebar = (
    <aside className="flex h-full w-[min(16rem,85vw)] flex-col border-r border-outline-variant/40 bg-surface-container-lowest">
      <div className="flex items-center gap-3 border-b border-outline-variant/30 px-5 py-5">
        <div>
          <p className="font-display text-headline-sm font-bold text-on-surface">Oknitech Serve</p>
          <p className="text-label-sm text-on-surface-variant">Client Portal</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {portalNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-label-md transition-colors ${
              isActive(item.href)
                ? "bg-primary-fixed text-primary font-medium"
                : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
            }`}
          >
            
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="space-y-1 border-t border-outline-variant/30 px-3 py-4">
        <Link
          href="/book-consultation"
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary-container px-3 py-2.5 text-label-md font-medium text-on-primary hover:opacity-90"
        >
          
          New Engagement
        </Link>
        <Link
          href="/support"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-label-md text-on-surface-variant hover:bg-surface-container-low"
        >
          
          Help Center
        </Link>
        <button
          type="button"
          onClick={async () => {
            await logout();
            router.push("/login");
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-label-md text-on-surface-variant hover:bg-surface-container-low"
        >
          
          Log Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-background">
      <div className="hidden lg:flex">{Sidebar}</div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-on-surface/40"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 shadow-xl">{Sidebar}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-outline-variant/40 bg-surface-container-lowest/90 px-4 backdrop-blur-md md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg px-2 py-2 text-label-md text-on-surface-variant lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              Menu
            </button>
            <div className="relative hidden sm:block">
              <input
                type="search"
                placeholder="Search services, docs, invoices…"
                className="w-40 min-w-0 rounded-lg border border-outline-variant/50 bg-surface-container-low py-2 px-3 pr-12 text-body-sm outline-none focus:border-primary-container md:w-64 lg:w-80"
              />
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-outline-variant/50 px-1.5 py-0.5 text-[10px] text-outline">
                ⌘K
              </kbd>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/book-consultation"
              className="hidden items-center gap-1.5 rounded-lg bg-primary-container px-3 py-2 text-label-md font-medium text-on-primary md:inline-flex"
            >
              Quick Action
            </Link>
            <Link
              href="/notifications"
              className="relative rounded-lg px-3 py-2 text-label-md text-on-surface-variant hover:bg-surface-container-low"
            >
              Alerts
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary-container" />
            </Link>
            <div className="flex items-center gap-2 rounded-lg border border-outline-variant/40 px-2 py-1.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-fixed text-label-sm font-semibold text-primary">
                {user.first_name?.[0]?.toUpperCase() ?? "U"}
              </div>
              <div className="hidden sm:block">
                <p className="text-label-md font-medium text-on-surface">{user.first_name}</p>
                <p className="text-label-sm text-on-surface-variant">Premium Client</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <div className="mx-auto max-w-[1440px] px-4 py-6 md:px-6 lg:px-8">{children}</div>
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-outline-variant/40 bg-surface-container-lowest lg:hidden">
          {portalMobileNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-2.5 text-center text-[10px] leading-tight ${
                isActive(item.href) ? "text-primary" : "text-on-surface-variant"
              }`}
            >
              <span className="w-full truncate">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
