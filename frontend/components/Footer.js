import Image from "next/image";
import React from "react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer>
      <div className="wrapper">
        <Image src="/full_logo_light.svg" width="145" height="45" alt="Deluxe Mods" />
        <div className="socials">
          <a href="">About</a>
          <a href="">Gmail</a>
          <a href="">Discord</a>
        </div>
        <div className="copyright">
          <p>All rights reserved {year} ®</p>
        </div>
      </div>
    </footer>
  );
}
