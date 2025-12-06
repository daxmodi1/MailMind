import DashboardLayoutClient from "@/components/dashboardUI/DashboardLayoutClient";

export const metadata = {
  title: 'Dashboard',
};

export default function DashboardLayout({ children }) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}