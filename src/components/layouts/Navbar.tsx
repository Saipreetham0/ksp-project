'use client';

import { Bell, Menu, X } from 'lucide-react';
import { UserNav } from './UserNav';
import {
  Sheet,
  // SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useState } from 'react';

interface NavbarProps {
  onMenuClick: () => void;
}

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  isRead: boolean;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'New Login Alert',
      description: 'New login detected from Chrome on Windows',
      time: '2 minutes ago',
      isRead: false,
    },
    {
      id: '2',
      title: 'Welcome',
      description: '',
      time: '5 minutes ago',
      isRead: false,
    },
    // {
    //   id: '3',
    //   title: 'Security Update',
    //   description: 'Important security update for your account',
    //   time: '3 hours ago',
    //   isRead: false,
    // },
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, isRead: true } : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      isRead: true
    })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          className="text-gray-500 hover:text-gray-600 lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="flex flex-1 items-center justify-end px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <button className="relative text-gray-500 hover:text-gray-600">
                  <Bell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md">
                <SheetHeader className="mb-4">
                  <SheetTitle className="flex justify-between items-center">
                    <span>Notifications</span>
                    <div className="flex gap-2 px-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={markAllAsRead}
                        disabled={unreadCount === 0}
                      >
                        Mark all as read
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearNotifications}
                        disabled={notifications.length === 0}
                      >
                        Clear all
                      </Button>
                    </div>
                  </SheetTitle>
                  <SheetDescription>
                    You have {unreadCount} unread notifications
                  </SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-8rem)]">
                  <div className="space-y-4">
                    {notifications.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No notifications
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`relative p-4 rounded-lg border ${
                            notification.isRead ? 'bg-white' : 'bg-blue-50'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <h4 className="text-sm font-medium">
                                {notification.title}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {notification.description}
                              </p>
                              <p className="text-xs text-gray-400">
                                {notification.time}
                              </p>
                            </div>
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>

            <UserNav />
          </div>
        </div>
      </div>
    </header>
  );
}