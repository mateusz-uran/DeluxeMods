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
        <li key={index} className={styles.categoryItem}>
          <button
            className={styles.btnCategory}
            onClick={() => {
              setVisibleCategories((prev) => ({
                ...prev,
                [index]: !prev[index],
              }));
            }}
          >
            <div className={styles.singleCat}>
              {category.subCategory.length > 0 && (
                <span className={styles.iconWrapper}>
                  <FaArrowDown />
                </span>
              )}
              <div className={styles.catNameWrapper}>
                <p>{category.categoryName}</p>
              </div>
            </div>
            <ul
              className={styles.subCategoryList}
              style={{
                display: visibleCategories[index] ? "block" : "none",
              }}
            >
              {category.subCategory.map((sub, subIndex) => (
                <li key={subIndex}>
                  <Link href={`/${sub.slug}`}>
                    <p
                      className={styles.singleSubCat}
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
  ) : (
    <p>Categories are missing.</p>
  );
}
