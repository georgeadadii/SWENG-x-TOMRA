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
        <aside className={`w-64 h-screen bg-black text-white flex flex-col p-6 ${roboto.className} relative overflow-hidden border-r border-purple-500/10`}>
            {/* Background gradient effect */}
            <div 
                className="absolute inset-0 opacity-30 z-0" 
                style={{
                    background: 'radial-gradient(circle at 30% 30%, rgba(138, 43, 226, 0.4), transparent 70%)',
                    filter: 'blur(40px)',
                }}
            />
            
            <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-400 mb-8 relative z-10">Dashboard</h2>
            
            <nav className="flex flex-col gap-5 relative z-10">
                <Link
                    href="/dashboard/images"
                    className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-300 ${
                        pathname === "/dashboard/images" 
                            ? "bg-gradient-to-r from-purple-700 to-blue-900 shadow-[0_0_15px_rgba(139,92,246,0.3)] border border-purple-500/30" 
                            : "hover:bg-purple-900/20 hover:border hover:border-purple-500/20 hover:shadow-[0_0_10px_rgba(139,92,246,0.15)]"
                    }`}
                >
                    <FaImages className="text-purple-300" /> 
                    <span>Gallery</span>
                </Link>
                
                <Link
                    href="/dashboard/metrics"
                    className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-300 ${
                        pathname === "/dashboard/metrics" 
                            ? "bg-gradient-to-r from-purple-700 to-blue-900 shadow-[0_0_15px_rgba(139,92,246,0.3)] border border-purple-500/30" 
                            : "hover:bg-purple-900/20 hover:border hover:border-purple-500/20 hover:shadow-[0_0_10px_rgba(139,92,246,0.15)]"
                    }`}
                >
                    <CgPerformance className="text-purple-300" /> 
                    <span>Metrics</span>
                </Link>

                <Link
                    href="/dashboard/swiping"
                    className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-300 ${
                        pathname === "/dashboard/swiping" 
                            ? "bg-gradient-to-r from-purple-700 to-blue-900 shadow-[0_0_15px_rgba(139,92,246,0.3)] border border-purple-500/30" 
                            : "hover:bg-purple-900/20 hover:border hover:border-purple-500/20 hover:shadow-[0_0_10px_rgba(139,92,246,0.15)]"
                    }`}
                >
                    <FaRegHandPointer className="text-purple-300" /> 
                    <span>SwipeToConfirm</span>
                </Link>
            </nav>
            
            <div className="mt-auto relative z-10">
                <button
                    className="w-full flex items-center justify-center gap-4 p-3 rounded-lg bg-gradient-to-r from-red-800 to-red-900 transition-all duration-300 hover:shadow-[0_0_15px_rgba(220,38,38,0.3)] border border-red-500/30 hover:from-red-700 hover:to-red-800"
                    onClick={handleLogout}
                >
                    <FaSignOutAlt /> 
                    <span>Logout</span>
                </button>
            </div>
            
            {/* Floating tags/labels for visual effect */}
            <div className="absolute bottom-20 -left-10 opacity-10 text-white text-xs px-3 py-1 bg-purple-500/20 rounded-full transform rotate-45">
                Cat
            </div>
            <div className="absolute bottom-40 -right-8 opacity-10 text-white text-xs px-3 py-1 bg-blue-500/20 rounded-full transform -rotate-15">
                Dog
            </div>
        </aside>
    );
};

export default Sidebar;