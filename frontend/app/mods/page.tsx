// /mods - url to show last six mods
import React from "react";
import ModsHandler from "./ModsHandler";

const PAGE_NUMBER: number = 1;

export default function ModsMainPage() {
  const modsUrl: string = `/mod/all?page=${PAGE_NUMBER}`;

  return <ModsHandler url={modsUrl} />;
}
