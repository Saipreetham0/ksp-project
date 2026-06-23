"use client";

import { Bell, Menu } from "lucide-react";
import { UserNav } from "./UserNav";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NavbarProps {
  onMenuClick: () => void;
}

// ponytail: static placeholder list. Upgrade: fetch from a notifications source
// and re-add unread/mark-read state when there's real data to act on.
const NOTIFICATIONS = [
  { id: "1", title: "New login alert", description: "New login from Chrome on Windows.", time: "2m ago" },
  { id: "2", title: "Welcome to KSP Electronics", description: "Your workspace is ready to go.", time: "5m ago" },
];

export function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6 lg:px-8">
      <button
        type="button"
        className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex flex-1 items-center justify-end gap-1.5">
        <Sheet>
          <SheetTrigger asChild>
            <button
              className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {NOTIFICATIONS.length > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
              )}
            </button>
          </SheetTrigger>
          <SheetContent className="flex w-full flex-col p-0 sm:max-w-md">
            <SheetHeader className="border-b border-border p-5">
              <SheetTitle>Notifications</SheetTitle>
              <SheetDescription className="sr-only">
                Recent activity in your workspace
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="flex-1">
              <div className="divide-y divide-border">
                {NOTIFICATIONS.map((n) => (
                  <div key={n.id} className="px-5 py-4">
                    <p className="text-sm font-medium leading-tight">{n.title}</p>
                    <p className="text-sm text-muted-foreground">{n.description}</p>
                    <p className="text-[11px] text-muted-foreground/70">{n.time}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>

        <UserNav />
      </div>
    </header>
  );
}
