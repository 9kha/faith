"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Input,
} from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Bell, Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function AdminHeader() {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="sticky top-0 z-20 flex h-16 items-center justify-between px-4 border-b bg-background/95 backdrop-blur">
      <div className="flex items-center gap-4">
        <button className="rounded-md p-2 text-gray-400 hover:bg-muted hover:text-gray-900">
          <Menu size={20} />
        </button>
        <div className="hidden md:flex items-center gap-1">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger>
              <Button variant="outline" size="sm" className="hidden md:flex items-center gap-2 px-2" onClick={() => setSheetOpen(true)}>
                <Search size={16} />
                <span className="text-sm font-medium">Search</span>
                <kbd className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">Ctrl+K</kbd>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Command Palette</SheetTitle>
              </SheetHeader>
              <Input placeholder="Search pages, leads, projects..." className="mt-4" />
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="rounded-md p-2 text-gray-400 hover:bg-muted hover:text-gray-900">
          <Bell size={20} />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="outline" size="sm" className="hidden flex items-center gap-2 pl-2 pr-1">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <span className="font-medium">Admin</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Link href="/admin/admin/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Account settings</DropdownMenuItem>
            <DropdownMenuItem className="destructive">
              <Link href="/admin/login">Sign out</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Avatar className="hidden md:flex h-8 w-8">
          <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin" />
          <AvatarFallback>AD</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
