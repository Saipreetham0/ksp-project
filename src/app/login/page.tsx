// app/page.tsx
"use client";
// import Login from '@/components/Login';

// export default function Home() {
//   return <Login />;
// }



// import React, { useState } from "react";
// import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
// import { auth } from "@/lib/firebase";
// import { useRouter } from "next/navigation";
// import Image from "next/image";

// export default function Login() {
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();

//   const signInWithGoogle = async () => {
//     setLoading(true);
//     try {
//       const provider = new GoogleAuthProvider();
//       await signInWithPopup(auth, provider);
//       router.push("/dashboard");
//     } catch (error) {
//       console.error("Error signing in with Google:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

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



import React from "react";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";

export default function LoginPage() {
  const { signInWithGoogle, loading } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome</h2>
          <p className="mt-2 text-gray-600">Please sign in to continue</p>
        </div>

        <button
          onClick={signInWithGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-5 h-5 border-t-2 border-b-2 border-gray-900 rounded-full animate-spin" />
          ) : (
            <>
              <Image
                className="w-5 h-5 mr-2"
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google logo"
                width={10}
                height={10}
              />
              Sign in with Google
            </>
          )}
        </button>
      </div>
    </div>
  );
}