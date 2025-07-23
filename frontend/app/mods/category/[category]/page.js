// /mods/category - fetch last 6 mods by category

import React from "react";
import ModsHandler from "../../ModsHandler";

export default async function ModsByCategory({params}) {
  const parameter = await params
  const modsUrl = `/api/mod/all/category/${parameter.category}/${1}`;

  console.log("Rendering ModsByCategory", parameter);
  
  return <ModsHandler url={modsUrl} />
}
