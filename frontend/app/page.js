"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import api from "@/utils/api";
import PreviewMod from "@/components/mods/PreviewMod";

export default function Home() {
  const [mods, setMods] = useState([]);

  useEffect(() => {
    async function fetchMods() {
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
        {mods.map((singleMod) => (
          <PreviewMod key={singleMod.slug} mod={singleMod}/>
        ))}
      </main>
      <aside>nawigacja</aside>
    </div>
  );
}
