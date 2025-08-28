"use client";

import api from "@/utils/api";
import React, { useEffect, useState } from "react";
import styles from "./modsHandler.module.css"
import PreviewMod from "@/components/mods/PreviewMod";
import Categories from "@/components/categories/Categories";
import Link from "next/link";

const MODS_PER_PAGE = 6;

export default function ModsHandler({ url }) {
  const [data, setData] = useState({ mods: [], totalCount: 0 });

  useEffect(() => {
    async function fetchMods() {
      try {
        const response = await api.get(url);
        setData(response.data);
      } catch (err) {
        console.error("Failed to fetch mods", err);
      }
    }

    fetchMods();
  }, [url]);

  const totalPages = Math.ceil(data.totalCount / MODS_PER_PAGE);

  //TODO: handle response when data array is empty

  return (
    <div className={styles.page}>
      <main className={styles.content}>
        <div className={styles.modsWrapper}>
          {data.mods.length > 0 ? (
            data.mods.map((mod) => <PreviewMod key={mod.slug} mod={mod} />)
          ) : (
            <p>No mods available.</p>
          )}
        </div>

        <div className={styles.pagination}>
          {[...Array(totalPages)].map((_, i) => (
            <Link key={i} href={`/mods/page/${i + 1}`}>
              <button>
                {i + 1}
              </button>
            </Link>
          ))}
        </div>
      </main>

      <aside className={styles.categoriesWrapper}>
        <Categories />
      </aside>
    </div>
  );
}
