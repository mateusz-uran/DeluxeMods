// /mods - url to show last six mods
import React from "react";
import ModsHandler from "./ModsHandler";

const PAGE_NUMBER = 1;

export default function ModsMainPage() {
  const modsUrl = `/api/mod/all/${PAGE_NUMBER}`;

  console.log("Rendering ModsMainPage")

  return <ModsHandler url={modsUrl} />;
}
