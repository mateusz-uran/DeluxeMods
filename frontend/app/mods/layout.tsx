"use client";

import Categories from "@/components/categories/Categories";
import React from "react";

export default function ModsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="max-w-[1000px] flex justify-center bg-[var(--background-gray-3)]">
      <main className="mt-2 mr-2 pt-2 w-full">{children}</main>
      <aside className="w-[180px] pt-2 bg-white mt-4 rounded">
        <h4 className="pl-2 font-bold text-[var(--font-gray-dark-1)]">
          Categories
        </h4>
        <Categories />
      </aside>
    </div>
  );
}
