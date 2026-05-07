'use client';

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  return (
    <>
      {!isAdminPage && <Navbar />}
      <main>
        {children}
      </main>
      {!isAdminPage && <BottomNav />}
    </>
  );
}
