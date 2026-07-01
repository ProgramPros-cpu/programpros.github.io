"use client";

import { useAuth } from "@/components/AuthProvider";
import { usePathname } from "next/navigation";
import { redirect } from "next/navigation";
import { Heart } from "lucide-react";

const authRoutes = ["/login", "/signup"];

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const pathname = usePathname() ?? "";
  const isAuthRoute = authRoutes.includes(pathname);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          gap: 12,
          color: "var(--muted)",
        }}
      >
        <span className="logo-mark" style={{ width: 40, height: 40 }}>
          <Heart size={20} />
        </span>
        <span style={{ fontWeight: 600 }}>Loading...</span>
      </div>
    );
  }

  if (!session && !isAuthRoute) {
    redirect("/login");
    return null;
  }

  if (session && isAuthRoute) {
    redirect("/");
    return null;
  }

  return <>{children}</>;
}
