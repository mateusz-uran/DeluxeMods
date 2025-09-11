"use client"

import { usePathname, useSearchParams } from "next/navigation";
import React from "react";
import { FaHome } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa";

export default function BreadCrumb() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const category = searchParams.get("category");
  const segments = pathname.split("/").filter(Boolean);

  const lastSegment = segments[segments.length - 1] || "";

  const transformedSegment =
    lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);

  const transformedCategory = category
    ?.replace("-", " ")
    .split(" ")
    .map((word) => {
      if (word === word.toUpperCase()) return word;
      if (word.length <= 3 && word === word.toLowerCase())
        return word.toUpperCase();
      if (word[0] === word[0].toUpperCase()) return word;
      return word[0].toUpperCase() + word.slice(1);
    })
    .join(" ");

  const items = [transformedSegment];
  if (transformedCategory) items.push(transformedCategory);

  return (
    <div className="flex items-center mt-2 py-2 text-xs">
      <FaHome className="font-light text-[var(--font-gray-dark-2)]" />
      <FaArrowRight className="mx-2 font-light text-[var(--font-gray-dark-2)]" />
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center">
          <span className="font-normal text-[var(--font-gray-dark-1)]">{item}</span>
          {idx < items.length - 1 && <FaArrowRight className="mx-2 text-[var(--font-gray-dark-2)]" />}
        </div>
      ))}
    </div>
  );
}
