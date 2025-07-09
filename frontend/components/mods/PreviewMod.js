import React from "react";
import styles from "./previewMod.module.css";
import Link from "next/link";

export default function PreviewMod({ mod }) {
  return (
    <div className={styles.mod}>
      <Link href={`/${mod.slug}`}>
        <div className={styles.hWrapper}>
          <h3>{mod.name}</h3>
        </div>
        <div className={styles.imgWrapper}>
          <img src={mod.previewPhoto} alt={mod.name} />
        </div>
      </Link>
    </div>
  );
}
