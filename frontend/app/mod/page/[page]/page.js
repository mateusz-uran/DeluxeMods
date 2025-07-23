import React from "react";
import ModListPage from "../../ModListPage";

// page to show 6 mods on each page
export default function ModsOtherPages({ params }) {
  const unwrappedParams = React.use(params);
  const currentPage = parseInt(unwrappedParams.page, 10);
  return <ModListPage currentPage={currentPage} category={""} />;
}
