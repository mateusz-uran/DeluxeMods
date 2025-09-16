"use client";

import React, { useEffect } from "react";
import api from "@/utils/api";
import { useParams } from "next/navigation";

export default function ReviewMod() {
  const params = useParams<{ slug: string}>()

  useEffect(() => {
    async function fetchReview() {
      try {
        const response = await api.get(`review/single?slug=${params.slug}`);
        console.log(`Error: ${response.error}`)
      } catch (err) {
        console.error("Failed to fetch review", err);
      }
    }

    fetchReview();
  }, []);

  return (
    <div className="">review with mod {params.slug}</div> 
  );
}
