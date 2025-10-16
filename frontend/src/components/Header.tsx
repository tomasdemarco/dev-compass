'use client'
import React from "react";
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link";
import { cn } from "@/lib/utils";

const Header = () => {
    const router = useRouter();
    const pathname = usePathname();

    const linkClasses = (href: string) => cn(
        "px-10 py-3 text-sm rounded-md cursor-pointer transition-colors hover:bg-gray/25 text-white hover:text-secondary-gp select-none",
        { "text-secondary-gp": pathname === href }
    );

    return (
        <div className="flex z-10 bg-header-gp dark:bg-black w-full fixed shadow shadow-white/10 space-x-4 h-20 items-center">
            {/* Logo and Title */}
            <div className="flex-1 flex items-center">
                <picture className="ml-10 my-5 cursor-pointer select-none">
                    <source
                        className="h-10"
                        media="(max-width: 480px)"
                        srcSet="/images/logoGp-480w.png"
                    />
                    <img
                        className="h-10"
                        src="/images/logoGp-480w.png"
                        alt="DevCompass Logo"
                        onClick={() => router.replace("/catalog")}
                    />
                </picture>
                <Link
                    className="text-xl text-white font-bold ml-5 flex-1 flex items-center select-none"
                    href="/catalog">
                    DevCompass
                </Link>
            </div>

            {/* Navigation Links */}
            <div className="flex-none flex items-center justify-center font-bold">
                <Link className={linkClasses("/catalog")} href="/catalog">
                    Catalog
                </Link>
                <Link className={linkClasses("/environments")} href="/environments">
                    Environments
                </Link>
                <Link className={linkClasses("/full-diagram")} href="/full-diagram">
                    Full Diagram
                </Link>
                <Link className={linkClasses("/gitflow")} href="/gitflow">
                    GitFlow
                </Link>
            </div>

            {/* Right empty space */}
            <div className="flex-1"></div>
        </div>
    );
};

export default Header;
