import React from "react";
import ModListPage from "../../ModListPage";

// page to show last 6 mods by specific category
export default function ModsByCategory({params}) {
  return <ModListPage currentPage={1} category={params.category} />;

  // const parsed = JSON.parse(params?.value || "{}");
  // const category = parsed.category;
  // return <ModListPage currentPage={1} category={category} />;
}
