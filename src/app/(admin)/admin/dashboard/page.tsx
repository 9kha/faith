export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl border bg-white p-6">
        <h3 className="text-sm font-medium text-gray-500">Total Visits</h3>
        <p className="mt-1 text-2xl font-bold">12,450</p>
        <p className="mt-2 text-sm text-gray-400">+12% vs last month</p>
      </div>
      <div className="rounded-xl border bg-white p-6">
        <h3 className="text-sm font-medium text-gray-500">Inquiries</h3>
        <p className="mt-1 text-2xl font-bold">342</p>
        <p className="mt-2 text-sm text-gray-400">+8% vs last month</p>
      </div>
      <div className="rounded-xl border bg-white p-6">
        <h3 className="text-sm font-medium text-gray-500">Site Visits</h3>
        <p className="mt-1 text-2xl font-bold">89</p>
        <p className="mt-2 text-sm text-gray-400">+5 vs last week</p>
      </div>
      <div className="rounded-xl border bg-white p-6">
        <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
        <p className="mt-1 text-2xl font-bold">₹2.4 Cr</p>
        <p className="mt-2 text-sm text-gray-400">+18% vs last month</p>
      </div>
    </div>
  );
}
