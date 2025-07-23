import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Navbar() {
  return (
    <nav>
      <div className="wrapper">
        <Link href="/"><Image src="/logo.svg" width="45" height="45" alt="Deluxe Mods" /></Link>
        <Link href="/login">
          <Image src="/profile.svg" width="35" height="35" alt="Profile" />
        </Link>
      </div>
    </nav>
  );
}
