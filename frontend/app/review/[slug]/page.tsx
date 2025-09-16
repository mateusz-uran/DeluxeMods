import React from "react";
import api from "@/utils/api";
import { notFound } from "next/navigation";

export default async function ReviewMod({
  params,
}: {
  params: { slug: string };
}) {
  try {
    const res = await api.get(`review/single?slug=${params.slug}`);
    return <div>{res.data}</div>;
  } catch {
    notFound();
  }
}
