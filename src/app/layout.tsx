// import type { Metadata } from "next";
// import Footer from "@/components/Footer";
// import Navbar from "@/components/NavBar";
import "@/app/globals.css";

// export const metadata: Metadata = {
//   title: "KSP Projects",
//   description: "Empowering students with cutting-edge IoT and ML solutions",
// };

import { Providers } from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://checkout.razorpay.com/v1/checkout.js" defer />
        <script src="https://cdn.razorpay.com/widgets/affordability/affordability.js"defer />
      </head>
      <body
        suppressHydrationWarning={true}
        className="flex min-h-screen flex-col"
      >
        <main className="flex-1">
          {/* <Navbar /> */}
          <Providers>{children}</Providers>
          {/* {children} */}
          {/* <Footer /> */}
        </main>
      </body>
    </html>
  );
}
