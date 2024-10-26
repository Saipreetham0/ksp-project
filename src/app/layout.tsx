// // app/layout.tsx
// import type { Metadata } from "next";
// import React, { ReactNode } from "react";

// // import { Inter } from "next/font/google";
// import Footer from "@/components/Footer";
// import Navbar from "@/components/NavBar";
// import "./globals.css";
// // import { AuthProvider } from "../app/context/AuthContext";

// // const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "KSP Projects",
//   description: "Empowering students with cutting-edge IoT and ML solutions",
// };

// // type RootLayoutProps = {
// //   children: ReactNode;
// // };

// // export default function RootLayout({
// //   children,
// // }: {
// //   children: React.ReactNode;
// // }) {

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {

// // export default function RootLayout({ children }: RootLayoutProps) {
//   return (
//     <html lang="en">
//       <body suppressHydrationWarning={true}>
//         <Navbar />
//         <main>
//           {/* <AuthProvider>{children}</AuthProvider> */}
//           {children}
//         </main>
//         <Footer />
//       </body>
//     </html>
//   );
// }

import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Navbar from "@/components/NavBar";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "KSP Projects",
  description: "Empowering students with cutting-edge IoT and ML solutions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning={true}
        className="flex min-h-screen flex-col"
      >
        <main className="flex-1">
          <Navbar />
          {children}
          <Footer />
        </main>
      </body>
    </html>
  );
}
