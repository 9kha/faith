import Link from "next/link";

export default function AdminIndexPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
      <p className="text-gray-600 mb-6">
        Welcome to the admin panel. Select an option below:
      </p>
      <div className="space-y-3">
        <Link
          href="/admin/dashboard"
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Dashboard
        </Link>
        <Link
          href="/admin/builders"
          className="px-6 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
        >
          Builders
        </Link>
        <Link
          href="/admin/projects"
          className="px-6 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
        >
          Projects
        </Link>
        <Link
          href="/admin/properties"
          className="px-6 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
        >
          Properties
        </Link>
        <Link
          href="/admin/leads"
          className="px-6 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
        >
          Leads
        </Link>
        <Link
          href="/admin/media"
          className="px-6 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
        >
          Media Library
        </Link>
      </div>
    </div>
  );
}
