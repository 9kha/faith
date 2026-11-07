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
import {
  Layout,
  Users,
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
  Users,
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
  { label: "Dashboard", href: "/admin/admin/dashboard", icon: "Layout" },
  { label: "Leads", href: "/admin/admin/leads", icon: "Users" },
  { label: "Builders", href: "/admin/admin/builders", icon: "Building2" },
  { label: "Projects", href: "/admin/admin/projects", icon: "Home" },
  { label: "Properties", href: "/admin/admin/properties", icon: "Home" },
  { label: "Inventory", href: "/admin/admin/inventory", icon: "Layout" },
  { label: "Sales", href: "/admin/admin/sales", icon: "DollarSign" },
  { label: "Payments", href: "/admin/admin/payments", icon: "CreditCard" },
  { label: "Commissions", href: "/admin/admin/commissions", icon: "BarChart3" },
  { label: "Partners", href: "/admin/admin/partners", icon: "Users" },
  { label: "Staff", href: "/admin/admin/staff", icon: "Shield" },
  { label: "Media", href: "/admin/admin/media", icon: "Image" },
  { label: "Pages", href: "/admin/admin/pages", icon: "FileText" },
  { label: "Menus", href: "/admin/admin/menus", icon: "Link" },
  { label: "Branding", href: "/admin/admin/branding", icon: "Palette" },
  { label: "SEO", href: "/admin/admin/seo", icon: "Target" },
  { label: "Blog", href: "/admin/admin/blog", icon: "FileText" },
  { label: "Settings", href: "/admin/admin/settings", icon: "Settings" },
] as const;

export function AdminSidebar() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent className="h-full w-[260px] flex flex-col">
          <SidebarHeader className="flex items-center gap-2 px-4 py-4">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <Home size={20} />
            </div>
            <span className="font-bold text-lg tracking-tight">ChannelPartner</span>
          </SidebarHeader>
          <SidebarGroup>
            <SidebarMenu>
              {adminNav.map((item) => {
                const Icon = iconMap[item.icon];
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton render={() => (
                      <Link href={item.href} className="flex items-center gap-2 w-full">
                        <Icon size={18} className="mr-3" />
                        {item.label}
                      </Link>
                    )} />
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
          <SidebarFooter>
            <SidebarMenuItem>
              <SidebarMenuButton render={() => (
                <Link href="/admin/login" className="flex items-center gap-2 w-full">
                  <LogOut size={18} className="mr-3" />
                  Sign out
                </Link>
              )} />
            </SidebarMenuItem>
          </SidebarFooter>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
}
