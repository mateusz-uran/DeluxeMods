import Image from "next/image";
import React from "react";

type LinkElementProps = {
  href: string;
  content: string;
};

const linkStyles =
  "mr-2 p-3 text-[var(--font-gray-light)] rounded-lg text-sm bg-[var(--background-gray-1)] transition-all duration-200 hover:bg-[var(--background-gray-2)]";

function LinkElement({ href, content }: LinkElementProps) {
  return (
    <a className={linkStyles} href={href}>
      {content}
    </a>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[var(--background-gray-0)] flex h-70 w-full flex-col items-center">
      <div className="max-w-[1000px] h-full flex w-full flex-col justify-between px-5 py-5">
        <Image
          className="mb-1"
          src="/full_logo_light.svg"
          width="145"
          height="45"
          alt="Deluxe Mods"
        />
        <div>
          <LinkElement href="/" content="Gmail" />
          <LinkElement href="/" content="Discord" />
          <LinkElement href="/" content="About" />
        </div>
        <div className="text-right text-sm text-[var(--font-gray-light)] rounded-lg">
          <p>All rights reserved {year} ®</p>
        </div>
      </div>
    </footer>
  );
}
