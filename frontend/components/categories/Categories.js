import api from "@/utils/api";
import React, { useEffect, useState } from "react";
import styles from "./categories.module.css";
import { FaArrowDown } from "react-icons/fa6";
import Link from "next/link";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [visibleCategories, setVisibleCategories] = useState({});

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await api.get("/api/mod/categories");
        setCategories(response.data);
      } catch (error) {
        console.error("Failed to fetch categories from backend!");
      }
    }

    fetchCategories();
  }, []);

  return categories.length > 0 ? (
    <ul className={styles.categories}>
      {categories.map((category, index) => (
        <button
          key={index}
          className={styles.catWrapper}
          onClick={() => {
            setVisibleCategories((prev) => ({
              ...prev,
              [index]: !prev[index],
            }));
          }}
        >
          {category.subCategory.length > 0 && (
            <span>
              <FaArrowDown />
            </span>
          )}
          <li className={styles.singleCat}>
            <p>{category.categoryName}</p>
            <ul>
              {category.subCategory.map((sub, subIndex) => (
                <li
                  key={subIndex}
                  style={{
                    display: visibleCategories[index] ? "block" : "none",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link href={`/${sub.slug}`}>{sub.name}</Link>
                </li>
              ))}
            </ul>
          </li>
        </button>
      ))}
    </ul>
  ) : (
    <p>Categories are missing.</p>
  );
}
