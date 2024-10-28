// // src/middlewares/withAuth.ts
// "use client";
// import React from 'react';
// import { useAuth } from "@/app/context/AuthContext";
// import { useRouter, usePathname } from 'next/navigation';
// import { useEffect, useState } from 'react';
// import { doc, getDoc } from 'firebase/firestore';
// import { db } from '@/lib/firebase';



// type UserRole = 'user' | 'moderator' | 'admin';

// interface UserData {
//   uid: string;
//   email: string;
//   role: UserRole;
// }

// // Cache for storing user roles
// const roleCache = new Map<string, UserRole>();

// export function withAuth(
//   WrappedComponent: React.ComponentType<any>,
//   allowedRoles: UserRole[],
//   options = { redirectTo: '/login' }
// ) {
//   return function AuthenticatedComponent(props: any) {
//     const { user, loading: authLoading } = useAuth();
//     const router = useRouter();
//     const pathname = usePathname();
//     const [loading, setLoading] = useState(true);
//     const [hasAccess, setHasAccess] = useState(false);

//     useEffect(() => {
//       async function checkAuth() {
//         if (authLoading) return;

//         // If no user, redirect to login
//         if (!user) {
//           // Store the current path for redirect after login
//           sessionStorage.setItem('redirectAfterLogin', pathname);
//           router.push(options.redirectTo);
//           return;
//         }

//         try {
//           // Check cache first
//           let userRole = roleCache.get(user.uid);

//           // If not in cache, fetch from Firestore
//           if (!userRole) {
//             const userDoc = await getDoc(doc(db, 'users', user.uid));
//             const userData = userDoc.data() as UserData;

//             if (!userData || !userData.role) {
//               throw new Error('User role not found');
//             }

//             userRole = userData.role;
//             // Cache the role
//             roleCache.set(user.uid, userRole);
//           }

//           // Check if user has required role
//           const hasRequiredRole = allowedRoles.includes(userRole);
//           setHasAccess(hasRequiredRole);

//           if (!hasRequiredRole) {
//             router.push('/unauthorized');
//           }
//         } catch (error) {
//           console.error('Auth check failed:', error);
//           router.push('/error');
//         } finally {
//           setLoading(false);
//         }
//       }

//       checkAuth();
//     }, [user, authLoading, router, pathname]);

//     // Show loading state
//     if (authLoading || loading) {
//       return (
//         <div className="min-h-screen flex items-center justify-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
//         </div>
//       );
//     }

//     // Don't render anything while redirecting
//     if (!hasAccess || !user) {
//       return null;
//     }

//     // Clear role cache on unmount
//     useEffect(() => {
//       return () => {
//         roleCache.clear();
//       };
//     }, []);

//     // Render component if authenticated and authorized
//     return <WrappedComponent {...props} />;
//   };
// }

// // Helper hook for role checks within components
// export function useUserRole() {
//   const { user } = useAuth();
//   const [role, setRole] = useState<UserRole | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function fetchRole() {
//       if (!user) {
//         setRole(null);
//         setLoading(false);
//         return;
//       }

//       try {
//         // Check cache first
//         let userRole = roleCache.get(user.uid);

//         if (!userRole) {
//           const userDoc = await getDoc(doc(db, 'users', user.uid));
//           const userData = userDoc.data() as UserData;

//           if (userData && userData.role) {
//             userRole = userData.role;
//             roleCache.set(user.uid, userRole);
//           }
//         }

//         setRole(userRole || null);
//       } catch (error) {
//         console.error('Error fetching role:', error);
//         setRole(null);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchRole();
//   }, [user]);

//   return { role, loading };
// }
