'use client';

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const Navbar: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <nav className="w-full bg-black p-3 flex items-center justify-between relative font-orbitron opacity-80">
      <div className="flex items-center">
        <Image src="/logo.png" alt="Logo" width={160} height={160} className="ml-12 mr-24" />
        <ul className="list-none flex ml-5">
          {["Products", "About", "Support"].map((text, index) => (
            <li
              key={index}
              className={`ml-20 transition-opacity duration-300 ${hoveredIndex === index ? 'opacity-100' : 'opacity-80'}`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <Link href={`#${text.toLowerCase()}`} className="no-underline text-white text-base font-bold">
                {text}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <button className="bg-transparent text-white border border-white rounded-lg px-4 py-2 text-sm font-bold cursor-pointer mr-12 transition-all duration-300 hover:bg-white hover:text-black">
        Account
      </button>
      
    </nav>
  );
};

export default Navbar;
