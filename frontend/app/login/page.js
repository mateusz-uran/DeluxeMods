"use client";

import React, { useState } from "react";
import styles from "./login.module.css";
import api from "@/utils/api";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams()

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const login = async (e) => {
    e.preventDefault();

    try {
      await api.post("/login", {
        email,
        password,
        rememberMe,
      });

      const redirectTo = searchParams.get("from") || "/"
      router.push(redirectTo || "/")
    } catch (error) {
      console.error(error) || "Login failed";
    }
  };

  return (
    <div className={styles.wrapper}>
      <form onSubmit={login}>
        <h2>Login</h2>
        <p className="error">Wrong email or password</p>
        <div className={styles.inputWrapper}>
          <p>Email</p>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className={styles.inputWrapper}>
          <p>Password</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className={styles.submitWrapper}>
          <div className={styles.rememberme}>
            <input
              type="checkbox"
              value={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <p>Remember me</p>
          </div>
          <button type="submit" className="primary-btn">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
