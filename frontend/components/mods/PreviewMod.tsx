import React from "react";
import Link from "next/link";

type ModPreview = {
  name: string;
  previewPhoto: string;
  slug: string;
};

export default function PreviewMod({ mod }: Readonly<{ mod: ModPreview }>) {
  return (
    <div className="flex items-center transition-all duration-200 ease-in-out hover:scale-[1.01]">
      <Link href={`/review/${mod.slug}`}>
        <div className="rounded p-1 text-[var(--font-gray-dark-0)] h-15 flex text-center justify-center items-center bg-white">
          <h3>{mod.name}</h3>
        </div>
        <div>
          <img
            src={mod.previewPhoto}
            alt={mod.name}
            className="rounded-b-md object-contain"
          />
        </div>
      </Link>
    </div>
  );
}
