// src/components/layouts/Sidebar.tsx
"use client";

// import { usePathname } from "next/navigation";
// import Link from "next/link";
// import {
//   LayoutDashboard,
//   Users,
//   FileText,
//   Share2,
//   DollarSign,
//   Settings,
//   X,
// } from "lucide-react";

// interface SidebarProps {
//   open: boolean;
//   setOpen: (open: boolean) => void;
// }

// export function Sidebar({ open, setOpen }: SidebarProps) {
//   const pathname = usePathname();

//   const navigation = [
//     { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
//     { name: "Projects", href: "/projects", icon: FileText },
//     { name: "Referrals", href: "/dashboard/referrals", icon: Share2 },
//     { name: "Earnings", href: "/dashboard/earnings", icon: DollarSign },
//     { name: "Team", href: "/dashboard/team", icon: Users },
//     { name: "Settings", href: "/dashboard/settings", icon: Settings },
//   ];



//   return (
//     <>
//       <div
//         className={`${
//           open ? "block" : "hidden"
//         } fixed inset-0 z-40 lg:hidden bg-gray-600 bg-opacity-75 transition-opacity`}
//         onClick={() => setOpen(false)}
//       />

//       <div
//         className={`${
//           open ? "translate-x-0" : "-translate-x-full"
//         } fixed inset-y-0 z-50 flex w-72 flex-col bg-gray-900 transition-transform duration-300 ease-in-out lg:translate-x-0`}
//       >
//         <div className="flex h-16 flex-shrink-0 items-center justify-between px-6">
//           <Link href="/dashboard" className="flex items-center">
//             <span className="text-2xl font-bold text-white">KSP Projects</span>
//           </Link>
//           <button
//             type="button"
//             className="lg:hidden text-gray-400 hover:text-gray-200"
//             onClick={() => setOpen(false)}
//           >
//             <X className="h-6 w-6" />
//           </button>
//         </div>

//         <div className="flex flex-1 flex-col overflow-y-auto">
//           <nav className="flex-1 space-y-1 px-3 py-4">
//             {navigation.map((item) => {
//               const isActive = pathname === item.href;
//               //   const active = isActive(item.href);
//               return (
//                 <Link
//                   key={item.name}
//                   href={item.href}
//                   className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
//                     isActive
//                       ? "bg-gray-800 text-white"
//                       : "text-gray-300 hover:bg-gray-800 hover:text-white"
//                   }`}
//                 >
//                   <item.icon className="h-5 w-5 mr-3" />
//                   {item.name}
//                 </Link>
//               );
//             })}
//           </nav>

//           <div className="p-4">
//             <div className="rounded-md bg-gray-800 p-4">
//               <div className="flex items-center justify-between">
//                 <div className="text-sm font-medium text-white">Storage</div>
//                 <div className="text-sm font-medium text-gray-400">75%</div>
//               </div>
//               <div className="mt-2 h-2 rounded-full bg-gray-700">
//                 <div
//                   className="h-2 rounded-full bg-blue-500"
//                   style={{ width: "75%" }}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }


import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  FileText,
  Share2,
  DollarSign,
  Settings,
  X,
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Projects", href: "/projects", icon: FileText },
    { name: "Referrals", href: "/dashboard/referrals", icon: Share2 },
    { name: "Earnings", href: "/dashboard/earnings", icon: DollarSign },
    { name: "Team", href: "/dashboard/team", icon: Users },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === "/projects") {
      // Match both /projects and /projects/[id] routes
      return pathname === href || pathname.startsWith(`${href}/`);
    }
    return pathname === href;
  };

  return (
    <>
      <div
        className={`${
          open ? "block" : "hidden"
        } fixed inset-0 z-40 lg:hidden bg-gray-600 bg-opacity-75 transition-opacity`}
        onClick={() => setOpen(false)}
      />

      <div
        className={`${
          open ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 z-50 flex w-72 flex-col bg-gray-900 transition-transform duration-300 ease-in-out lg:translate-x-0`}
      >
        <div className="flex h-16 flex-shrink-0 items-center justify-between px-6">
          <Link href="/dashboard" className="flex items-center">
            <span className="text-2xl font-bold text-white">KSP Projects</span>
          </Link>
          <button
            type="button"
            className="lg:hidden text-gray-400 hover:text-gray-200"
            onClick={() => setOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto">
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    active
                      ? "bg-gray-800 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  <item.icon
                    className={`h-5 w-5 mr-3 ${
                      active ? "text-white" : "text-gray-400"
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* <div className="p-4">
            <div className="rounded-md bg-gray-800 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-white">Storage</div>
                <div className="text-sm font-medium text-gray-400">75%</div>
              </div>
              <div className="mt-2 h-2 rounded-full bg-gray-700">
                <div
                  className="h-2 rounded-full bg-blue-500"
                  style={{ width: "75%" }}
                />
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </>
  );
}

export default Sidebar;