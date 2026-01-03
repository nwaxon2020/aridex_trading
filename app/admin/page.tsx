import Link from "next/link";

export default function AdminPage() {
  return (
    <div>
        <h1 className="md:text-2xl font-semibold mt-16 mb-2">Site Settings....</h1>
        <nav className=" w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 sm:justify-center">
                <Link
                href="/admin/homePageDashboard"
                className="px-4 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/40 hover:to-purple-600/40 transition text-center"
                >
                Home Dashboard
                </Link>

                <Link
                href="/admin/blogPageDashboard"
                className="px-4 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/40 hover:to-purple-600/40 transition text-center"
                >
                Blog Dashboard
                </Link>

                <Link
                href="/admin/aboutPageDashboard"
                className="px-4 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/40 hover:to-purple-600/40 transition text-center"
                >
                About Dashboard
                </Link>
            </div>
        </nav>
    </div>
  );
}