import {
  LayoutDashboard,
  Briefcase,
  FolderOpen,
  Wallet,
  Mail,
  LifeBuoy,
  CalendarDays,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  Search,
  Plus,
  MoreHorizontal,
  Download,
  Upload,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  work: Briefcase,
  folder_shared: FolderOpen,
  payments: Wallet,
  mail: Mail,
  contact_support: LifeBuoy,
  calendar_today: CalendarDays,
  notifications: Bell,
  settings: Settings,
  help: HelpCircle,
  logout: LogOut,
  search: Search,
  add: Plus,
  more_horiz: MoreHorizontal,
  download: Download,
  upload: Upload,
  description: FileText,
  check: CheckCircle2,
  schedule: Clock,
  warning: AlertTriangle,
  chevron_right: ChevronRight,
};

export default function PortalIcon({
  name,
  className = "h-5 w-5",
}: {
  name: string;
  className?: string;
}) {
  const Icon = iconMap[name] ?? LayoutDashboard;
  return <Icon className={className} aria-hidden />;
}
