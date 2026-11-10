export const metadata = {
  title: "Faith Venture Realty - Admin",
  description: "Real estate admin panel",
};

export default function AdminRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-background text-foreground">{children}</div>;
}
