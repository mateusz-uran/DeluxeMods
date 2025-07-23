"use client";

import { useEffect, useState } from "react";
import api from "@/utils/api";
import Link from "next/link";
import PreviewMod from "@/components/mods/PreviewMod";
import Categories from "@/components/categories/Categories";
import styles from "./modListPage.module.css";

const MODS_PER_PAGE = 10;
const modRouterApiPrefix = "/api/mod";

export default function ModListPage({ currentPage, category }) {
  const [data, setData] = useState({ mods: [], totalCount: 0 });

  useEffect(() => {
    async function fetchMods() {
      try {
        let response;
        if (category) {
          response = await api.get(
            `${modRouterApiPrefix}/all/category/${category}/${currentPage}`
          );
        } else {
          response = await api.get(`${modRouterApiPrefix}/all/${currentPage}`);
        }
        setData(response.data);
      } catch (err) {
        console.error("Failed to fetch mods", err);
      }
    }

    fetchMods();
  }, [currentPage, category]);

  const totalPages = Math.ceil(data.totalCount / MODS_PER_PAGE);

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
            <Link key={i} href={`/mod/page/${i + 1}`}>
              <button className={i + 1 === currentPage ? styles.active : ""}>
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
