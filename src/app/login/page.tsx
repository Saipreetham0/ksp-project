
// "use client";



// // app/Login/page.tsx
// import React from "react";
// import { useAuth } from "@/hooks/useAuth";
// import Image from "next/image";

// export default function LoginPage() {
//   const { signInWithGoogle, loading } = useAuth();

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50">
//       <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
//         <div className="text-center">
//           <h2 className="text-3xl font-bold text-gray-900">Welcome</h2>
//           <p className="mt-2 text-gray-600">Please sign in to continue</p>
//         </div>

//         <button
//           onClick={signInWithGoogle}
//           disabled={loading}
//           className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           {loading ? (
//             <div className="w-5 h-5 border-t-2 border-b-2 border-gray-900 rounded-full animate-spin" />
//           ) : (
//             <>
//               <Image
//                 className="w-5 h-5 mr-2"
//                 src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
//                 alt="Google logo"
//                 width={10}
//                 height={10}
//               />
//               Sign in with Google
//             </>
//           )}
//         </button>
//       </div>
//     </div>
//   );
// }


'use client'

import ProfessionalAuthForm from '@/components/auth/ProfessionalAuthForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Floating Shapes */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-32 h-32 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-white/30">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(99, 102, 241, 0.1) 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo/Brand Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-6">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xl">P</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
              ProjectX
            </h1>
            <p className="text-gray-600 text-lg">
              Professional Project Management
            </p>
          </div>

          <ProfessionalAuthForm redirectTo="/dashboard" />

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              Need help?{' '}
              <a href="mailto:support@projectx.com" className="text-blue-600 hover:text-blue-700 font-medium">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
