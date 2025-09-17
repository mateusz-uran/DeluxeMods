import React from "react";

export default function Wrapper({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="min-h-[1200px] w-full max-w-[1000px]">{children}</div>;
}
