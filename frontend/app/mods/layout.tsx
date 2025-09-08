import Categories from "@/components/categories/Categories";
import React from "react";

import BreadCrumb from "./BreadCrumb";
import { BACKEND_URL } from "@/utils/config.server";

export default async function ModsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  console.log("Rendered layout.tsx from /mods");

  // const res = await fetch(`${BACKEND_URL}/categories/all`, {
  //   cache: "force-cache", // or "no-store" if always fresh
  //   credentials: "include",
  // });

  // const categories = await res.json();

  return (
    <div>
      <BreadCrumb />
      <div className="h-[1200px] w-[1000px] flex justify-center bg-[var(--background-gray-3)]">
        <main className="mt-2 mr-2 pt-2 w-full">{children}</main>
        <aside className="w-[180px] pt-2 bg-white mt-4 rounded">
          <h4 className="pl-2 font-bold text-[var(--font-gray-dark-1)]">
            Categories
          </h4>
          {/* <Categories initialCategories={categories}/> */}
          <Categories/>
        </aside>
      </div>
    </div>
  );
}
