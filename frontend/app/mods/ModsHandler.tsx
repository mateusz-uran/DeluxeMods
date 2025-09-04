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
  const pageSize: number = 6;

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
  }, [currentPage]);

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="grid grid-cols-2 auto-rows-auto gap-6">
        {data.mods.length > 0 ? (
          data.mods.map((mod) => <PreviewMod key={mod.slug} mod={mod} />)
        ) : (
          <p>No mods available.</p>
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
    </div>
  );
}
