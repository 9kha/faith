"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Layout,
  LayoutDashboard,
  Users,
  UserCheck,
  Building2,
  Home,
  DollarSign,
  CreditCard,
  BarChart3,
  Shield,
  Image,
  FileText,
  Link as LinkIcon,
  Palette,
  Target,
  Settings,
  LogOut,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Layout,
  LayoutDashboard,
  Users,
  UserCheck,
  Building2,
  Home,
  DollarSign,
  CreditCard,
  BarChart3,
  Shield,
  Image,
  FileText,
  Link: LinkIcon,
  Palette,
  Target,
  Settings,
  LogOut,
};

const adminNav = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: "LayoutDashboard",
    section: "Overview",
  },
  { label: "Leads", href: "/admin/leads", icon: "Users", section: "Sales" },
  { label: "Clients", href: "/admin/clients", icon: "UserCheck", section: "Sales" },
  { label: "Properties", href: "/admin/properties", icon: "Home", section: "Sales" },
  { label: "Inventory", href: "/admin/inventory", icon: "CreditCard", section: "Sales" },
  { label: "Projects", href: "/admin/projects", icon: "Building2", section: "Catalogue" },
  { label: "Builders", href: "/admin/builders", icon: "Layout", section: "Catalogue" },
  { label: "Pages", href: "/admin/pages", icon: "FileText", section: "Catalogue" },
  { label: "Media", href: "/admin/media", icon: "Image", section: "Catalogue" },
  { label: "Settings", href: "/admin/settings", icon: "Settings", section: "System" },
] as const;

const sectionOrder = ["Overview", "Sales", "Catalogue", "System"] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <SidebarProvider className="w-auto shrink-0">
      <Sidebar className="border-r border-sidebar-border bg-sidebar">
        <SidebarContent className="flex h-full w-[264px] flex-col px-3 py-4">
          <SidebarHeader className="px-2 pb-4">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
                <Home size={18} />
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-[15px] font-semibold tracking-tight">
                  Faith Venture
                </span>
                <span className="text-[11px] uppercase tracking-[0.14em] text-sidebar-foreground/50">
                  Admin
                </span>
              </span>
            </Link>
          </SidebarHeader>

          <SidebarGroup className="flex-1 space-y-5 overflow-y-auto pr-1">
            {sectionOrder.map((section) => {
              const items = adminNav.filter((item) => item.section === section);
              if (items.length === 0) return null;
              return (
                <div key={section}>
                  <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-sidebar-foreground/45">
                    {section}
                  </p>
                  <SidebarMenu className="space-y-0.5">
                    {items.map((item) => {
                      const Icon = iconMap[item.icon];
                      const active = isActive(item.href);
                      return (
                        <SidebarMenuItem key={item.label}>
                          <SidebarMenuButton
                            isActive={active}
                            render={() => (
                              <Link
                                href={item.href}
                                className="flex w-full items-center gap-2.5 rounded-lg"
                              >
                                <Icon
                                  size={17}
                                  className={
                                    active
                                      ? "text-sidebar-primary"
                                      : "text-sidebar-foreground/60"
                                  }
                                />
                                <span>{item.label}</span>
                              </Link>
                            )}
                          />
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </div>
              );
            })}
          </SidebarGroup>

          <SidebarFooter className="mt-4 border-t border-sidebar-border px-1 pt-3">
            <SidebarMenuItem>
              <SidebarMenuButton
                render={() => (
                  <button
                    type="button"
                    onClick={() => void signOut({ callbackUrl: "/login" })}
                    className="flex w-full items-center gap-2.5 rounded-lg text-sidebar-foreground/70"
                  >
                    <LogOut size={17} />
                    <span>Sign out</span>
                  </button>
                )}
              />
            </SidebarMenuItem>
          </SidebarFooter>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
}
