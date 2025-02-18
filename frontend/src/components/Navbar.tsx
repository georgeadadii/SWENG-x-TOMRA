'use client';

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const Navbar: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <nav className="w-full bg-black p-3 flex items-center justify-between relative font-orbitron opacity-80">
      <div className="ml-12 flex items-center">
        <Image src="/logo.png" alt="Logo" width={160} height={160} />
        <div className="w-px h-10 bg-white mx-4"></div> {/* Vertical Line */}
        <Image src="/logo2.png" alt="Logo 2" width={160} height={160} />
      </div>

      <div className="flex items-center space-x-12 mr-12">
        <ul className="list-none flex space-x-12">
          {["Products", "About", "Support"].map((text, index) => (
            <li
              key={index}
              className={`transition-opacity duration-300 ${hoveredIndex === index ? 'opacity-100' : 'opacity-80'}`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <Link href={`#${text.toLowerCase()}`} className="no-underline text-white text-base font-bold">
                {text}
              </Link>
            </li>
          ))}
        </ul>
        <button className="bg-transparent text-white border border-white rounded-lg px-4 py-2 text-sm font-bold cursor-pointer transition-all duration-300 hover:bg-white hover:text-black">
          Account
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
