import Link from "next/link";
import React, { ReactNode } from "react";

type LinkElementProps = {
  children: ReactNode;
  href: string;
};

export default function LinkElement({ href, children }: LinkElementProps) {
  return (
    <Link
      href={href}
      className="p-2 rounded-full transition-all duration-200 hover:bg-gray-200"
    >
      {children}
    </Link>
  );
}
