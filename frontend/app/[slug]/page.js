import { BACKEND_URL } from "@/utils/config.server";
import { notFound } from "next/navigation";
import React from "react";

export default async function ReviewMod({ params }) {
  const { slug } = await params;

  try {
    const response = await fetch(`${BACKEND_URL}/api/mod/single/${slug}`);

    if (!response.ok) {
      return notFound();
    }

    const mod = await response.json();

    return (
      <div>
        <h2>{mod.name}</h2>
        <p>Deluxe: {mod.specification.isDeluxe}</p>
        <p>Download: {mod.specification.link}</p>
        <p>Author: {mod.specification.modAuthor}</p>
      </div>
    );
  } catch (error) {
    return notFound();
  }
}
