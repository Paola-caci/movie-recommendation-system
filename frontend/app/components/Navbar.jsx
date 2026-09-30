"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home" },
     { href: "/about", label: "About" },
    { href: "/movies", label: "Movies" },
    { href: "/recommendations", label: "Recommendations" },
  ];

  return (
    <header className="bg-gray-900/90 backdrop-blur-md sticky top-0 z-50 shadow-md border-b border-gray-800">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link
          href="/"
          className="text-2xl font-bold text-yellow-400 tracking-wide hover:scale-105 transition-transform"
        >
          🎬 NextMovies
        </Link>
        <ul className="flex gap-6">
          {links.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`relative px-2 py-1 transition-colors duration-200 ${
                    isActive
                      ? "text-yellow-400 font-semibold"
                      : "text-gray-300 hover:text-yellow-300"
                  }`}
                >
                  {label}
                  {isActive && (
                    <span className="absolute left-0 bottom-0 w-full h-[2px] bg-yellow-400 rounded-full"></span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
