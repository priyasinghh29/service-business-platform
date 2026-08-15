"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "@/components/marketing/Logo";

const navLinks = [
  { href: "/services", label: "Services" },
  { href: "/industries", label: "Industries" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function MarketingHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && href.startsWith("/") && !href.includes("#") && pathname.startsWith(href));

  return (
    <header
      className={`fixed left-0 top-0 z-50 w-full border-b bg-white/90 backdrop-blur-md transition-colors ${
        scrolled ? "border-black/5" : "border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-10">
        <Logo size="nav" />

        <nav className="hidden items-center gap-6 lg:flex xl:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`inline-flex items-center gap-1 text-[15px] font-medium transition-colors hover:text-[#007aff] ${
                isActive(link.href) ? "text-[#007aff]" : "text-black"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center justify-end gap-4 lg:flex xl:gap-5">
          <Link
            href="/login"
            className="text-[15px] font-medium text-black transition-colors hover:text-[#007aff]"
          >
            Log in
          </Link>
          <Link
            href="/book-consultation"
            className="rounded-full bg-[#001f3f] px-4 py-2.5 text-[15px] font-medium text-white transition-opacity hover:opacity-90 xl:px-5"
          >
            Book Consultation
          </Link>
        </div>

        <button
          type="button"
          className="shrink-0 text-sm font-medium text-black lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? "Close" : "Menu"}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-black/5 bg-white px-4 py-4 sm:px-6 lg:hidden">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="py-1 text-sm text-black">
                {link.label}
              </Link>
            ))}
            <Link href="/login" className="py-1 text-sm text-black">
              Log in
            </Link>
            <Link
              href="/book-consultation"
              className="rounded-full bg-[#001f3f] px-4 py-2.5 text-center text-sm font-medium text-white"
            >
              Book Consultation
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
