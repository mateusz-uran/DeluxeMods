import React from "react";
import ModListPage from "./ModListPage";

// main page to show last 6 mods
function ModsFirstPage() {
  return <ModListPage currentPage={1} category={""} />;
}

export default ModsFirstPage;
