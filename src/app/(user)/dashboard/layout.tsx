// import DashboardSidebar from "@/components/dashboard/Sidebar";
// import DashboardHeader from "@/components/dashboard/Header";

export default function DashboardLayout({
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
          {/* <Navbar /> */}
          
          <div className="flex h-screen">
            {/* <DashboardSidebar /> */}
            <div className="flex-1 flex flex-col">
              {/* <DashboardHeader /> */}
              <div className="flex-1 overflow-y-auto p-6">{children}</div>
            </div>
          </div>
        </main>
      </body>
    </html>
    // );

  );
}
