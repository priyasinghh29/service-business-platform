import {
  Building2,
  ClipboardCheck,
  Scale,
  FileBadge,
  Wallet,
  Users,
  Headset,
  Tag,
  ShieldCheck,
  Factory,
  ShoppingCart,
  Monitor,
  Landmark,
  Building,
  Truck,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  HeartPulse,
  Clock,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  account_balance: Building2,
  task: ClipboardCheck,
  gavel: Scale,
  app_registration: FileBadge,
  payments: Wallet,
  groups: Users,
  support_agent: Headset,
  sell: Tag,
  security: ShieldCheck,
  medical_services: HeartPulse,
  factory: Factory,
  shopping_cart: ShoppingCart,
  computer: Monitor,
  schedule: Clock,
  account_balance_wallet: Landmark,
  apartment: Building,
  local_shipping: Truck,
  school: GraduationCap,
  arrow_forward: ArrowRight,
  check_circle: CheckCircle2,
  expand_more: ChevronDown,
  mail: Mail,
  call: Phone,
  location_on: MapPin,
};

export default function DesignIcon({
  name,
  className = "h-6 w-6",
}: {
  name: string;
  className?: string;
}) {
  const Icon = iconMap[name] ?? Building2;
  return <Icon className={className} aria-hidden />;
}
