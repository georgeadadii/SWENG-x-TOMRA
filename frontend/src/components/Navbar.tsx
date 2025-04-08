'use client';

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const Navbar: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const navItems = [
    { text: "Home", path: "/" },
    { text: "About Us", path: "/about" },
  ];

  return (
    <nav className="w-full bg-black p-3 flex items-center justify-between relative font-orbitron opacity-80">
      <div className="ml-12 flex items-center">
        <Link href="/">
          <Image src="/logo.png" alt="Logo" width={160} height={160} />
        </Link>
        <div className="w-px h-10 bg-white mx-4"></div> {/* Vertical Line */}
        <Link href="/">
          <Image src="/logo_whiteText.png" alt="Logo 2" width={160} height={160} />
        </Link>
      </div>

      <div className="flex items-center space-x-12 mr-12">
        <ul className="list-none flex space-x-12">
          {navItems.map((item, index) => (
            <li
              key={index}
              className={`transition-opacity duration-300 ${hoveredIndex === index ? 'opacity-100' : 'opacity-80'}`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <Link 
                href={item.path} 
                className="no-underline text-white text-base font-bold hover:text-purple-400"
              >
                {item.text}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
