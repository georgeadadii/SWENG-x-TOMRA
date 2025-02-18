"use client";

import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { FaImages, FaRegHandPointer, FaSignOutAlt, FaCog } from "react-icons/fa";
import { CgPerformance } from "react-icons/cg";
import Link from "next/link";
import { Roboto } from "next/font/google";

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "700"] });

const Sidebar: React.FC = () => {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        console.log("Logging out...");
        router.push("/");
    };

    return (
        <aside className={`w-64 h-screen bg-black text-white flex flex-col p-6 ${roboto.className} shadow-lg`}> 
            <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-400 mb-6">Dashboard</h2>

            <nav className="flex flex-col gap-5">
                <Link
                    href="/dashboard/images"
                    className={`flex items-center gap-4 p-3 rounded-md transition-all ${
                        pathname === "/dashboard/images" 
                            ? "bg-gradient-to-r from-purple-500 to-indigo-600 shadow-lg" 
                            : "hover:bg-white/10"
                    }`}
                >
                    <FaImages /> Gallery
                </Link>

                <Link
                    href="/dashboard/metrics"
                    className={`flex items-center gap-4 p-3 rounded-md transition-all ${
                        pathname === "/dashboard/metrics" 
                            ? "bg-gradient-to-r from-purple-500 to-indigo-600 shadow-lg" 
                            : "hover:bg-white/10"
                    }`}
                >
                    <CgPerformance /> Metrics
                </Link>
                <Link
                    href="/dashboard/swiping"
                    className={`flex items-center gap-4 p-3 rounded-md transition-all ${
                        pathname === "/dashboard/swiping" 
                            ? "bg-gradient-to-r from-purple-500 to-indigo-600 shadow-lg" 
                            : "hover:bg-white/10"
                    }`}
                >
                    <FaRegHandPointer /> SwipeToConfirm
                </Link>

                <button
                    className="flex items-center gap-4 p-3 rounded-md bg-red-700 transition-all hover:bg-red-900 shadow-lg"
                    onClick={handleLogout}
                >
                    <FaSignOutAlt /> Logout
                </button>
            </nav>
        </aside>
    );
};

export default Sidebar;
