import Link from "next/link";
import React, { useState } from "react";

type PaginationProps = {
  totalCount: number;
  pageSize: number;
  currentPage: number;
  basePath?: string;
  onPageChange: (page: number) => void;
  siblingCount?: number;
};

export default function Pagination({
  totalCount,
  pageSize,
  currentPage,
  basePath = "/mods",
  onPageChange,
  siblingCount = 1,
}: PaginationProps) {
  const totalPages = Math.ceil(totalCount / pageSize);
  if (totalPages <= 1) return null;

  const createPageArray = () => {
    const pages: (number | string)[] = [];
    const startPage = Math.max(2, currentPage - siblingCount);
    const endPage = Math.min(totalPages - 1, currentPage + siblingCount);

    pages.push(1);

    if (startPage > 2) {
      pages.push("...");
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages - 1) {
      pages.push("...");
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = createPageArray();

  const handleClick = (page: number) => {
    if (onPageChange) onPageChange(page);
  };

  return (
    <div className="p-4 flex justify-center items-center text-xs">
      {currentPage > 1 && (
        <Link href={`${basePath}?page=${currentPage - 1}`}>
          <button onClick={() => handleClick(currentPage - 1)} className="px-4">
            Previous
          </button>
        </Link>
      )}
      {pages.map((page, idx) =>
        page === "..." ? (
          <span key={idx} className="px-3 text-gray-400">...</span>
        ) : (
          <Link
            key={idx}
            href={`${basePath}?page=${page}`}
            className="group mx-2"
          >
            <button
              onClick={() => handleClick(page as number)}
              className={`px-3 py-1 rounded transition-colors duration-200 ${
                currentPage === page
                  ? "bg-[var(--foreground-yellow)]"
                  : "bg-[var(--background-gray-2)] text-white group-hover:bg-[var(--background-gray-0)]"
              }`}
            >
              {page}
            </button>
          </Link>
        )
      )}
      {currentPage < totalPages && (
        <Link href={`${basePath}?page=${currentPage + 1}`}>
          <button
            className="px-4"
            disabled={currentPage === totalPages}
            onClick={() => handleClick(currentPage + 1)}
          >
            Next
          </button>
        </Link>
      )}
    </div>
  );
}
