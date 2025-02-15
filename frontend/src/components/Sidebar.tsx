"use client";

import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { FaImages, FaCog, FaSignOutAlt } from "react-icons/fa";
import { CgPerformance } from "react-icons/cg";
import Link from "next/link";

const Sidebar: React.FC = () => {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        console.log("Logging out...");
        // Perform logout logic here (clear session, etc.)
        router.push("/"); // Redirect to the landing page
    };

    return (
        <aside className="w-64 h-screen bg-gray-900 text-white flex flex-col p-5">
            <h2 className="text-xl font-semibold mb-6">Dashboard</h2>

            <nav className="flex flex-col gap-4">
                <Link
                    href="/dashboard/images"
                    className={`flex items-center gap-3 p-3 rounded-md ${
                        pathname === "/dashboard/images" ? "bg-gray-700" : "hover:bg-gray-800"
                    }`}
                >
                    <FaImages /> Images
                </Link>

                <Link
                    href="/dashboard/metrics"
                    className={`flex items-center gap-3 p-3 rounded-md ${
                        pathname === "/dashboard/metrics" ? "bg-gray-700" : "hover:bg-gray-800"
                    }`}
                >
                    <CgPerformance /> Metrics
                </Link>

                {/* Uncomment if needed */}
                {/* <Link
                    href="/settings"
                    className={`flex items-center gap-3 p-3 rounded-md ${
                        pathname === "/settings" ? "bg-gray-700" : "hover:bg-gray-800"
                    }`}
                >
                    <FaCog /> Settings
                </Link> */}

                <button
                    className="flex items-center gap-3 p-3 rounded-md bg-red-600 hover:bg-red-700"
                    onClick={handleLogout}
                >
                    <FaSignOutAlt /> Logout
                </button>
            </nav>
        </aside>
    );
};

export default Sidebar;
