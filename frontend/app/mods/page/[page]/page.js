// /mods/page/:page - url to fetch last six mods with paging

import React from "react";
import ModsHandler from "../../ModsHandler";

export default async function ModsPagination({ params }) {
  const parameter = await params;
  const modsUrl = `/api/mod/all/${parseInt(parameter.page)}`;

  console.log("Rendering ModsPagination");

  return <ModsHandler url={modsUrl} />;
}
