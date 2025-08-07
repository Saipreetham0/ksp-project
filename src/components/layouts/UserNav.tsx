// // src/components/layouts/UserNav.tsx
// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { User, Settings, CreditCard, LogOut } from "lucide-react";
// import Image from "next/image";

// export function UserNav() {
//   const [open, setOpen] = useState(false);

//   return (
//     <div className="relative">
//       <button
//         onClick={() => setOpen(!open)}
//         className="flex items-center gap-2 rounded-full bg-gray-100 p-2 hover:bg-gray-200"
//       >
//         <Image
//           src="/"
//           alt="User"
//           className="h-8 w-8 rounded-full"
//           width={20}
//           height={20}
//         />
//       </button>

//       {open && (
//         <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
//           <div className="py-1">
//             <div className="px-4 py-2 text-sm text-gray-900">
//               <p className="font-medium">John Doe</p>
//               <p className="text-gray-500">john@example.com</p>
//             </div>
//             <div className="border-t border-gray-100">
//               <Link
//                 href="/dashboard/profile"
//                 className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//               >
//                 <User className="mr-3 h-4 w-4" />
//                 Profile
//               </Link>
//               <Link
//                 href="/dashboard/settings"
//                 className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//               >
//                 <Settings className="mr-3 h-4 w-4" />
//                 Settings
//               </Link>
//               <Link
//                 href="/dashboard/billing"
//                 className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//               >
//                 <CreditCard className="mr-3 h-4 w-4" />
//                 Billing
//               </Link>
//               <button
//                 className="flex w-full items-center px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
//                 onClick={() => {
//                   // Handle logout
//                 }}
//               >
//                 <LogOut className="mr-3 h-4 w-4" />
//                 Sign out
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import {
//   User,
//   Settings,
//   // CreditCard,
//   LogOut,
// } from "lucide-react";
// import Image from "next/image";
// import { signOut } from "firebase/auth";
// import { useRouter } from "next/navigation";
// import { auth } from "@/lib/firebase"; // Make sure you have this firebase config file

// // import { useAuth } from "@/hooks/useAuth";

// export function UserNav() {
//   const [open, setOpen] = useState(false);
//   const [userData, setUserData] = useState({
//     displayName: "",
//     email: "",
//     photoURL: "",
//   });
//   const router = useRouter();

//   useEffect(() => {
//     // Subscribe to auth state changes
//     const unsubscribe = auth.onAuthStateChanged((user) => {
//       if (user) {
//         setUserData({
//           displayName: user.displayName || "User",
//           email: user.email || "",
//           photoURL: user.photoURL || "/default-avatar.png", // Provide a default avatar path
//         });
//       } else {
//         router.push("/login");
//       }
//     });

//     // Cleanup subscription
//     return () => unsubscribe();
//   }, [router]);

//   const handleSignOut = async () => {
//     try {
//       await signOut(auth);
//       router.push("/login");
//     } catch (error) {
//       console.error("Error signing out:", error);
//     }
//   };

//   return (
//     <div className="relative">
//       <button
//         onClick={() => setOpen(!open)}
//         className="flex items-center gap-2 rounded-full bg-gray-100 p-2 hover:bg-gray-200"
//       >
//         <Image
//           //   src={userData.photoURL}
//           //   alt={userData.displayName}

//           src={userData.photoURL || "/default-avatar.png"}
//           alt={userData.displayName || "User avatar"}
//           className="h-8 w-8 rounded-full object-cover"
//           width={32}
//           height={32}
//           onError={(e) => {
//             // Fallback for broken images
//             const target = e.target as HTMLImageElement;
//             target.src = "/default-avatar.png"; // Provide a default avatar path
//           }}
//         />
//       </button>

//       {open && (
//         <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
//           <div className="py-1">
//             <div className="px-4 py-2 text-sm text-gray-900">
//               <p className="font-medium">{userData.displayName}</p>
//               <p className="text-gray-500">{userData.email}</p>
//             </div>
//             <div className="border-t border-gray-100">
//               <Link
//                 href="/profile"
//                 className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                 onClick={() => setOpen(false)}
//               >
//                 <User className="mr-3 h-4 w-4" />
//                 Profile
//               </Link>
//               <Link
//                 href="/settings"
//                 className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                 onClick={() => setOpen(false)}
//               >
//                 <Settings className="mr-3 h-4 w-4" />
//                 Settings
//               </Link>
//               {/* <Link
//                 href="/dashboard/billing"
//                 className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                 onClick={() => setOpen(false)}
//               >
//                 <CreditCard className="mr-3 h-4 w-4" />
//                 Billing
//               </Link> */}
//               <button
//                 className="flex w-full items-center px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
//                 onClick={handleSignOut}
//               >
//                 <LogOut className="mr-3 h-4 w-4" />
//                 Sign out
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User, Settings, CreditCard, LogOut } from "lucide-react";
import Image from "next/image";
// import { supabase } from "@/utils/supabase";
import { supabase } from "@/lib/supabase";

import { useRouter } from "next/navigation";

export function UserNav() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Fetch the authenticated user's data
  useEffect(() => {
    const fetchUser = async () => {
      const { data: user, error } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        console.log(user);
      } else {
        // router.push("/login"); // Redirect to login if not authenticated
      }
      if (error) {
        console.error("Error fetching user:", error);
        // router.push("/login"); // Redirect to login if not authenticated
        // return null;
      }
    };

    fetchUser();
  }, [router]);

  // Handle sign out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    await supabase.auth.signOut({ scope: "local" });

    router.push("/login"); // Redirect to login page
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full bg-gray-100 p-2 hover:bg-gray-200"
      >
        <Image
          src={user?.user_metadata?.avatar_url || "/default-avatar.png"}
          alt="User"
          className="h-8 w-8 rounded-full"
          width={20}
          height={20}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            <div className="px-4 py-2 text-sm text-gray-900">
              <p className="font-medium">
                {user?.user_metadata?.full_name || "User"}
              </p>
              <p className="text-gray-500">{user?.email}</p>
            </div>
            <div className="border-t border-gray-100">
              <Link
                href="/dashboard/profile"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <User className="mr-3 h-4 w-4" />
                Profile
              </Link>
              <Link
                href="/dashboard/settings"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Settings className="mr-3 h-4 w-4" />
                Settings
              </Link>
              <Link
                href="/dashboard/billing"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <CreditCard className="mr-3 h-4 w-4" />
                Billing
              </Link>
              <button
                className="flex w-full items-center px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                onClick={handleSignOut}
              >
                <LogOut className="mr-3 h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
