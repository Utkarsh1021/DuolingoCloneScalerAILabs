import Sidebar, { MobileNav } from "@/components/layout/sidebar";
import TopBar from "@/components/layout/topbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 pb-24 md:pb-8">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}