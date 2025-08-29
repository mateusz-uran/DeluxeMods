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
      console.error("Login failed");
      setIsError(true);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[1000px] text-center mx-auto h-full flex items-center justify-center">
      <form onSubmit={login}>
        <h2>Login</h2>
        <p className="error" style={{ display: isError ? "block" : "" }}>
          Wrong email or password
        </p>
        <div className="p-3">
          <p>Email</p>
          <input
            type="text"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            disabled={isLoading}
          />
        </div>

        <div className="p-3">
          <p>Password</p>
          <input
            type="password"
            value={user.password}
            onChange={(e) => setUser({ ...user, password: e.target.value })}
            disabled={isLoading}
          />
        </div>

        <div className="p-3">
          <div className="flex mb-1">
            <input
              type="checkbox"
              checked={user.rememberMe}
              onChange={(e) =>
                setUser({ ...user, rememberMe: e.target.checked })
              }
              disabled={isLoading}
            />
            <p className="ml-1 flex items-center">Remember me</p>
          </div>
          <button type="submit" className="primary-btn" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}
