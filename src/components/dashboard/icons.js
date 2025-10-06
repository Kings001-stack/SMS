import {
  Brain,
  Lightbulb,
  Presentation,
  Layers3,
  FileBadge,
  MonitorPlay,
  LayoutGrid,
  Users2,
  LineChart,
  BookOpen,
  FileText,
  School,
  Bus,
  Wallet,
  Receipt,
  MessagesSquare,
  Building2,
  Wrench,
  Boxes,
  FileStack,
  Ticket,
  Inbox,
  Rocket,
  Cpu,
} from 'lucide-react'

const registry = {
  // Categories
  Design: Lightbulb,
  Skills: Presentation,
  Technology: Cpu,
  Business: Layers3,
  Academics: BookOpen,
  Attendance: FileText,
  Finance: Wallet,
  Invoices: Receipt,
  Payments: Wallet,
  Reports: FileBadge,
  Facilities: Wrench,
  Inventory: Boxes,
  Transport: Bus,
  Applications: Inbox,
  Enrollments: School,
  Waitlist: FileStack,

  // Nav sections
  Products: Layers3,
  Certificates: FileBadge,
  'Course studio': MonitorPlay,
  'LIVE class': MonitorPlay,
  Website: LayoutGrid,
  Marketing: Rocket,
  Analytics: LineChart,
  People: Users2,
  Messages: MessagesSquare,
  Operations: Building2,
}

export function getIcon(name) {
  return registry[name] || Layers3
}
