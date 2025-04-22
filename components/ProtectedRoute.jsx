// components/ProtectedRoute.jsx
"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children, requiredRole }) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      // not logged in
      router.replace("/user-login");
    } else if (requiredRole && user.role !== requiredRole) {
      // wrong role
      router.replace("/");
    }
  }, [user, router]);

  // meanwhile you can show a spinner…
  if (!user || (requiredRole && user.role !== requiredRole)) {
    return <div className='p-10 text-center'>Checking access…</div>;
  }
  return children;
}
