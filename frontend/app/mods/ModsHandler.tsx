"use client";

import api from "@/utils/api";
import React, { useEffect, useState } from "react";
import PreviewMod from "@/components/mods/PreviewMod";
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

  return (
    <>
      <div className="grid grid-cols-2 auto-rows-auto gap-6">
        {data.mods.length > 0 ? (
          data.mods.map((mod) => <PreviewMod key={mod.slug} mod={mod} />)
        ) : (
          <p>No mods available.</p>
        )}
      </div>

      <div className="text-center w-full p-2 my-2 flex justify-center">
        {[...Array(totalPages)].map((_, i) => (
          <Link key={i} href={`/mods?page=${i + 1}`} className="group">
            <button
              className="p-4 m-1 w-5 h-5 rounded-full flex text-center items-center 
              justify-center bg-[var(--background-gray-2)] text-white group-hover:bg-[var(--background-gray-0)] 
              transition-colors duration-200"
            >
              {i + 1}
            </button>
          </Link>
        ))}
      </div>
    </>
  );
}
