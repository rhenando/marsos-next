// File: src/context/AuthContext.js
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/firebase/config";
import { onAuthStateChanged, onIdTokenChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [intendedRoute, setIntendedRoute] = useState(null);

  useEffect(() => {
    async function setUserAndRole(user) {
      setCurrentUser(user);
      if (user) {
        // fetch custom data & token
        const idToken = await user.getIdToken();
        setToken(idToken);

        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setUserData(data);
          setRole(data.role);
        } else {
          console.warn("No user doc found. Defaulting to guest.");
          setUserData({ role: "guest" });
          setRole("guest");
        }

        // redirect if needed
        if (intendedRoute) {
          router.push(intendedRoute);
          setIntendedRoute(null);
        }
      } else {
        // fully logged out
        setUserData(null);
        setRole(null);
        setToken(null);
      }
      setLoading(false);
    }

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setLoading(true);
      setUserAndRole(user);
    });
    const unsubToken = onIdTokenChanged(auth, async (user) => {
      if (user) {
        const refreshed = await user.getIdToken(true);
        setToken(refreshed);
      }
    });

    // cross‑tab logout sync
    const onStorage = (e) => {
      if (e.key === "logout") {
        signOut(auth).then(() => {
          setCurrentUser(null);
          setUserData(null);
          setRole(null);
          router.push("/user-login");
        });
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      unsubAuth();
      unsubToken();
      window.removeEventListener("storage", onStorage);
    };
  }, [intendedRoute, router]);

  const logout = async () => {
    await signOut(auth);
    localStorage.setItem("logout", Date.now());
    setCurrentUser(null);
    setUserData(null);
    setRole(null);
    router.push(role === "admin" ? "/admin-login" : "/user-login");
  };

  const hasRole = (r) => role === r;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userData,
        role,
        token,
        loading,
        hasRole,
        logout,
        setIntendedRoute,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

//=============================================================================
// Usage: wrap any page or layout that should be protected...
export function ProtectedRoute({ children, requiredRole }) {
  const router = useRouter();
  const { currentUser, loading, hasRole, setIntendedRoute } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!currentUser) {
        setIntendedRoute(window.location.pathname);
        router.replace("/user-login");
      } else if (requiredRole && !hasRole(requiredRole)) {
        router.replace("/");
      }
    }
  }, [loading, currentUser, hasRole, requiredRole, router, setIntendedRoute]);

  if (loading || !currentUser) {
    return <div className='p-10 text-center'>Checking authentication…</div>;
  }
  return children;
}
