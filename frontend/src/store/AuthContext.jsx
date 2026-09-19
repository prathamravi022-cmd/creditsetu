/**
 * AuthContext — Clerk Authentication
 * Syncs Clerk's useUser into a shared context so all components
 * that import useAuth() continue to work unchanged.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useUser, useClerk } from "@clerk/react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { isSignedIn, user: clerkUser, isLoaded } = useUser();
  const clerk = useClerk();
  const [user, setUser] = useState(null);

  // Sync Clerk user into the shared context
  useEffect(() => {
    if (isLoaded && isSignedIn && clerkUser) {
      const userData = {
        id: clerkUser.id,
        name: clerkUser.fullName || clerkUser.firstName || "User",
        email: clerkUser.emailAddresses?.[0]?.emailAddress || "",
        avatar: clerkUser.imageUrl || "",
        mobile: clerkUser.phoneNumbers?.[0]?.phoneNumber || "",
        authMethod: "clerk",
        isAdmin: false,
      };
      setUser(userData);
    } else if (isLoaded && !isSignedIn) {
      setUser(null);
    }
  }, [isSignedIn, clerkUser, isLoaded]);

  const logout = useCallback(async () => {
    setUser(null);
    try { await clerk.signOut(); } catch {}
  }, [clerk]);

  const isAdmin = user?.isAdmin === true;

  return (
    <AuthContext.Provider
      value={{
        user, setUser,
        loading: !isLoaded,
        isAdmin,
        logout,
        isAuthenticated: !!user && isSignedIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
