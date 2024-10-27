// src/components/layouts/Navbar.tsx
'use client';

// import { useState } from 'react';
// import Link from 'next/link';
import { Menu, Bell,  } from 'lucide-react';
import { UserNav } from './UserNav';

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
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
            {/* <div className="hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="h-9 w-64 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute right-3 top-2 h-5 w-5 text-gray-400" />
              </div>
            </div> */}

            <button className="relative text-gray-500 hover:text-gray-600">
              <Bell className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                3
              </span>
            </button>

            <UserNav />
          </div>
        </div>
      </div>
    </header>
  );
}
