export const metadata = {
  title: "ChannelPartner Pro - Admin",
  description: "Real estate admin panel",
};

export default function AdminRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-gray-50">{children}</div>;
}
