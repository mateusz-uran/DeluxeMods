"use client";

import React from "react";
import ModsHandler from "./ModsHandler";
import { useSearchParams } from "next/navigation";

export default function ModsMainPage() {
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const category = searchParams.get("category");

  const modsUrl = category
    ? `/mod/all?category=${category}&page=${page}`
    : `/mod/all?page=${page}`;

  return <ModsHandler url={modsUrl} />;
}
