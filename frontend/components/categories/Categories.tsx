"use client";

import api from "@/utils/api";
import React, { useEffect, useState } from "react";
import { IoIosArrowDropdownCircle } from "react-icons/io";
import Link from "next/link";

interface ICategories {
  name: string;
  slug: string;
  subCategory: {
    name: string;
    slug: string;
  }[];
}
[];

export default function Categories() {
  const [categories, setCategories] = useState<ICategories[]>([]);
  const [visibleCategories, setVisibleCategories] = useState<boolean[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await api.get("/categories/all");
        setCategories(response.data);

        setVisibleCategories(new Array(response.data.length).fill(false));
      } catch (error) {
        console.error("Failed to fetch categories from backend!");
      }
    }

    fetchCategories();
  }, []);

  const toggleCategory = (index: number) => {
    const newVisible = [...visibleCategories];
    newVisible[index] = !newVisible[index];
    setVisibleCategories(newVisible);
  };

  if (categories.length === 0) return <p>Categories are missing.</p>;

  return (
    <>
      <h4 className="pl-2 font-bold text-[var(--font-gray-dark-1)]">
        Categories
      </h4>
      <ul className="list-none flex flex-col items-left gap-4 mx-0 my-2">
        {categories.map((category, index) => (
          <li key={index} className="max-w-200 text-base">
            <button
              className="group text-left p-1 rounded-xs"
              onClick={() => toggleCategory(index)}
            >
              <div className="flex items-center gap-2 group-hover:text-[var(--font-gray-dark-1)] transition-colors duration-200">
                {category.subCategory.length > 0 && (
                  <span
                    className={`text-gray-400  transition-all duration-300 ${
                      visibleCategories[index]
                        ? "-rotate-90 text-yellow-300"
                        : ""
                    }`}
                  >
                    <IoIosArrowDropdownCircle />
                  </span>
                )}
                <div>
                  <p>{category.name}</p>
                </div>
              </div>
              <ul
                className="[padding-left:calc(1.25rem+0.5rem)]"
                style={{
                  display: visibleCategories[index] ? "block" : "none",
                }}
              >
                {category.subCategory.map((sub, subIndex) => (
                  <li key={subIndex} className="text-sm">
                    <Link href={`/mods?category=${sub.slug}&page=1`}>
                      <p
                        className="hover:text-[var(--font-gray-dark-1)] transition-colors duration-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {sub.name}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
