import Image from "next/image";
import React from "react";

export default function Navbar() {
  return (
    <nav>
      <div className="wrapper">
          <Image
            src="logo.svg"
            width="45"
            height="45"
            alt="Deluxe Mods"
          />
          <Image
            src="profile.svg"
            width="35"
            height="35"
            alt="Profile"
          />
      </div>
    </nav>
  );
}
