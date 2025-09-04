"use client";

import api from "@/utils/api";
import React, { useEffect, useState } from "react";
import PreviewMod from "@/components/mods/PreviewMod";
import Pagination from "@/components/Pagination";

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

export default function ModsHandler({ url }: ModsHandlerTypes) {
  const [data, setData] = useState<modData>({ mods: [], totalCount: 0 });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const pageSize: number = 6;

  useEffect(() => {
    async function fetchMods() {
      try {
        setIsLoading(true);
        const response = await api.get(url);
        setData(response.data);
      } catch (err) {
        console.error("Failed to fetch mods", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMods();
  }, [currentPage, url]);

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="flex items-center justify-center">
        {isLoading ? null : data.mods.length > 0 ? (
          <div className="grid grid-cols-2 auto-rows-auto gap-6">
            {data.mods.map((mod) => (
              <PreviewMod key={mod.slug} mod={mod} />
            ))}
          </div>
        ) : (
          <div className="p-2 rounded bg-gray-200">
            <p>Mods for this category have not been tested yet.</p>
          </div>
        )}
      </div>

      <div>
        <Pagination
          totalCount={data.totalCount}
          pageSize={pageSize}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          basePath="/mods"
        />
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-gray-900/50 transition-opacity flex items-center justify-center">
          <svg
            className="text-gray-300 animate-spin"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            width="44"
            height="44"
          >
            <path
              d="M32 3C35.8083 3 39.5794 3.75011 43.0978 5.20749C46.6163 6.66488 49.8132 8.80101 52.5061 11.4939C55.199 14.1868 57.3351 17.3837 58.7925 20.9022C60.2499 24.4206 61 28.1917 61 32C61 35.8083 60.2499 39.5794 58.7925 43.0978C57.3351 46.6163 55.199 49.8132 52.5061 52.5061C49.8132 55.199 46.6163 57.3351 43.0978 58.7925C39.5794 60.2499 35.8083 61 32 61C28.1917 61 24.4206 60.2499 20.9022 58.7925C17.3837 57.3351 14.1868 55.199 11.4939 52.5061C8.801 49.8132 6.66487 46.6163 5.20749 43.0978C3.7501 39.5794 3 35.8083 3 32C3 28.1917 3.75011 24.4206 5.2075 20.9022C6.66489 17.3837 8.80101 14.1868 11.4939 11.4939C14.1868 8.80099 17.3838 6.66487 20.9022 5.20749C24.4206 3.7501 28.1917 3 32 3L32 3Z"
              stroke="var(--foreground-yellow)"
              stroke-width="5"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
            <path
              d="M32 3C36.5778 3 41.0906 4.08374 45.1692 6.16256C49.2477 8.24138 52.7762 11.2562 55.466 14.9605C58.1558 18.6647 59.9304 22.9531 60.6448 27.4748C61.3591 31.9965 60.9928 36.6232 59.5759 40.9762"
              stroke="currentColor"
              stroke-width="5"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="text-gray-900"
            ></path>
          </svg>
        </div>
      )}
    </div>
  );
}
