import { Metadata } from "next";
import { AdminThemeProvider } from "@/components/admin/AdminThemeContext";

export const metadata: Metadata = {
  title: "Admin Dashboard | Footimes",
  description: "Administrative control panel for Footimes.",
  robots: "noindex, nofollow", // Prevent admin pages from appearing in search results
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminThemeProvider>
      {children}
    </AdminThemeProvider>
  );
}
