import Categories from "@/components/categories/Categories";
import React from "react";

import BreadCrumb from "./BreadCrumb";

export default async function ModsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {

  return (
    <div>
      <BreadCrumb />
      <div className="h-[1200px] w-[1000px] flex justify-center bg-[var(--background-gray-3)]">
        <main className="mt-2 mr-2 pt-2 w-full">{children}</main>
        <aside className="w-[180px] pt-2 bg-white mt-4 rounded">
          <Categories/>
        </aside>
      </div>
    </div>
  );
}
