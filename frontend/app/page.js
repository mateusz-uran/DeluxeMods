"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import api from "@/utils/api";
import PreviewMod from "@/components/mods/PreviewMod";
import Categories from "@/components/categories/Categories";

export default function Home() {
  const [mods, setMods] = useState([]);

  useEffect(() => {
    async function fetchMods() {8
      try {
        const response = await api.get("/api/mod");
        setMods(response.data);
      } catch (error) {
        console.error("Failed to return last ten mods!");
      }
    }

    fetchMods();
  }, []);

  return (
    <div className={styles.page}>
      <main>
        {mods.length > 0 ? (
          mods.map((singleMod) => (
            <PreviewMod key={singleMod.slug} mod={singleMod} />
          ))
        ) : (
          <p>List of mods is empty at this moment.</p>
        )}
      </main>
      <aside>
        <Categories />
      </aside>
    </div>
  );
}
