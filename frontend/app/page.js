"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import api from "@/utils/api";
import PreviewMod from "@/components/mods/PreviewMod";
import Categories from "@/components/categories/Categories";

const MODS_PER_PAGE = 6;

export default function Home() {
  const [data, setData] = useState({ mods: [], totalPages: 0 });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function fetchMods() {
      8;
      try {
        const response = await api.get(`/api/mod/all/${currentPage}`);
        setData(response.data);
      } catch (error) {
        console.error("Failed to return last ten mods!");
      }
    }

    fetchMods();
  }, [currentPage]);

  const totalPages = Math.ceil(data.totalCount / data.mods.length || 1);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className={styles.page}>
      <main>
        {data.mods.length > 0 ? (
          data.mods.map((singleMod) => (
            <PreviewMod key={singleMod.slug} mod={singleMod} />
          ))
        ) : (
          <p>List of mods is empty at this moment.</p>
        )}
        <div className={styles.pagination}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => handlePageChange(i + 1)}>
              {i + 1}
            </button>
          ))}
        </div>
      </main>
      <aside>
        <Categories />
      </aside>
    </div>
  );
}
