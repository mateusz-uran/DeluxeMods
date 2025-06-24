"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import api from "@/utils/api";

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

    fetchMods()
  }, []);

  return (
    <div className={styles.page}>
      <main>
        {mods.map((singleMod => (
          <div key={singleMod.slug}>
            <h3>{singleMod.name}</h3>
            <img src={singleMod.previewPhoto} alt="mod" />
          </div>
        )))}
      </main>
      <aside>nawigacja</aside>
    </div>
  );
}
