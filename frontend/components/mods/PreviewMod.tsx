import React from "react";
import Link from "next/link";
import Image from "next/image";

type ModPreview = {
  name: string;
  previewPhoto: string;
  slug: string;
  isDeluxe: boolean;
};

export default function PreviewMod({ mod }: Readonly<{ mod: ModPreview }>) {
  return (
    <div className="flex items-center transition-all duration-200 ease-in-out hover:scale-[1.01]">
      <Link href={`/review/${mod.slug}`} className="relative">
        <div className="rounded p-1 text-[var(--font-gray-dark-0)] h-15 flex text-center justify-center items-center bg-white">
          <h3 className="font-bold">{mod.name}</h3>
        </div>
        <div>
          <img
            src={mod.previewPhoto}
            alt={mod.name}
            className="rounded-b-md object-contain"
          />
        </div>
        {mod.isDeluxe ? (
          <div className="absolute -top-3 -left-3">
            <div className="-rotate-35" title="Deluxe crown = mod is one of the best!">
              <Image
                src="/crone4.svg"
                width="30"
                height="30"
                alt="Deluxe Mods"
              />
            </div>
          </div>
        ) : (
          <></>
        )}
      </Link>
    </div>
  );
}
