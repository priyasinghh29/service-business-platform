export const portalNav = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/my-bookings", label: "My Bookings", icon: "schedule" },
  { href: "/my-services", label: "My Services", icon: "work" },
  { href: "/messages", label: "Messages", icon: "mail" },
  { href: "/reviews", label: "Reviews", icon: "check" },
  { href: "/documents", label: "Documents", icon: "folder_shared" },
  { href: "/invoices", label: "Invoices", icon: "payments" },
  { href: "/support", label: "Support Centre", icon: "contact_support" },
  { href: "/calendar", label: "Calendar", icon: "calendar_today" },
  { href: "/notifications", label: "Notifications", icon: "notifications" },
  { href: "/profile", label: "Profile", icon: "settings" },
  { href: "/settings", label: "Settings", icon: "more_horiz" },
] as const;

export const portalMobileNav = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/my-bookings", label: "Bookings", icon: "schedule" },
  { href: "/messages", label: "Messages", icon: "mail" },
  { href: "/documents", label: "Docs", icon: "folder_shared" },
  { href: "/settings", label: "More", icon: "more_horiz" },
] as const;
