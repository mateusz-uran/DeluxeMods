import { BACKEND_URL } from "@/utils/config.server";
import { notFound } from "next/navigation";
import React from "react";
import styles from './reviewMod.module.css'
import api from "@/utils/api";

export default async function ReviewMod({ params }) {
  const { slug } = await params;

  try {
    const response = await api.get(`review/single?slug=${slug}`);
    console.log(response);
    

    if (!response.ok) {
      return notFound();
    }

    const mod = await response.json();

    return (
      <div className={styles.reviewWrapper}>
        <h2>{mod.name}</h2>
        <p>Deluxe: {mod.specification.isDeluxe ? "yes" : "no"}</p>
        <p>Download: {mod.specification.link}</p>
        <p>Author: {mod.specification.modAuthor}</p>
      </div>
    );
  } catch (error) {
    return notFound();
  }
}
