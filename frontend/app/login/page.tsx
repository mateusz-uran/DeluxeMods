"use client";

import React, { useState } from "react";
import api from "@/utils/api";
import { useRouter, useSearchParams } from "next/navigation";

interface UserForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState<UserForm>({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [isError, setIsError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const login = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsError(false);
    setIsLoading(true);

    try {
      await api.post("/login", {
        email: user.email,
        password: user.password,
        rememberMe: user.rememberMe,
      });

      const redirectTo = searchParams.get("from") || "/";
      router.push(redirectTo || "/");
    } catch (error) {
      console.error("Login failed", error);
      setIsError(true);
      setIsLoading(false);
      setUser({ ...user, password: "" });
    }
  };

  return (
    <div className="text-center flex justify-center mt-2">
      <form onSubmit={login}>
        <h2 className="text-xl">Login</h2>
        <p className="error" style={{ display: isError ? "block" : "" }}>
          Wrong email or password
        </p>
        <div className="p-3 flex flex-col">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            disabled={isLoading}
            autoComplete="email"
            required
          />
        </div>

        <div className="p-3 flex flex-col">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={user.password}
            onChange={(e) => setUser({ ...user, password: e.target.value })}
            disabled={isLoading}
            autoComplete="current-password"
            required
          />
        </div>

        <div className="p-3 flex flex-col">
          <div className="flex mb-1">
            <input
              id="rememberMe"
              type="checkbox"
              checked={user.rememberMe}
              onChange={(e) =>
                setUser({ ...user, rememberMe: e.target.checked })
              }
              disabled={isLoading}
            />
            <label htmlFor="rememberMe" className="ml-1 flex items-center">
              Remember me
            </label>
          </div>
          <button type="submit" className="primary-btn" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}
