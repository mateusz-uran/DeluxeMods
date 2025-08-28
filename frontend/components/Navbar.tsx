import Image from "next/image";
import React from "react";
import LinkElement from "./utilities/LinkElement";

export default function Navbar() {
  return (
    <nav className="bg-gray-300 flex justify-center">
      <div className="max-w-[1000px] flex items-center justify-between w-full py-2">
        <LinkElement href="/">
          <Image src="/logo.svg" width="25" height="25" alt="Deluxe Mods" />
        </LinkElement>
        <LinkElement href="/login">
          <Image src="/profile.svg" width="25" height="25" alt="Profile" />
        </LinkElement>
      </div>
    </nav>
  );
}
