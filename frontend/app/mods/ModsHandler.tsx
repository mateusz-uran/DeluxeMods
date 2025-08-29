"use client";

import api from "@/utils/api";
import React, { useEffect, useState } from "react";
import styles from "./modsHandler.module.css";
import PreviewMod from "@/components/mods/PreviewMod";
import Categories from "@/components/categories/Categories";
import Link from "next/link";

type ModsHandlerTypes = {
  url: string;
};

interface ModsArray {
  categories: string[];
  isDeluxe: boolean;
  name: string;
  previewPhoto: string;
  slug: string;
  specification: {
    modAuthor: string;
  };
}

interface modData {
  mods: ModsArray[];
  totalCount: number;
}

const MODS_PER_PAGE: number = 6;

export default function ModsHandler({ url }: ModsHandlerTypes) {
  const [data, setData] = useState<modData>({ mods: [], totalCount: 0 });

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
    <div className="flex justify-center bg-[var(--background-gray-3)]">
      <main className="mt-2 mr-2 pt-2">
        <div className="grid grid-cols-2 auto-rows-auto gap-6">
          {data.mods.length > 0 ? (
            data.mods.map((mod) => <PreviewMod key={mod.slug} mod={mod} />)
          ) : (
            <p>No mods available.</p>
          )}
        </div>

        <div className="flex justify-center items-center w-100 p-2">
          {[...Array(totalPages)].map((_, i) => (
            <Link key={i} href={`/mods?page=${i + 1}`}>
              <button>{i + 1}</button>
            </Link>
          ))}
        </div>
      </main>

      <aside className="pt-2 bg-white flex">
        <Categories />
      </aside>
    </div>
  );
}
