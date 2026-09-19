import React from "react";
import { SignInButton } from "@clerk/react";
import { Shield } from "lucide-react";
import PageBackdrop from "../art/PageBackdrop";

export default function AdminLogin() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 bg-auth">
      <PageBackdrop variant="admin" />
      <div className="cs-orb cs-orb-green w-[440px] h-[440px] top-1/3 -right-32 opacity-90" />
      <div className="w-full max-w-md relative z-10 text-center">
        <div className="glass-card rounded-2xl p-8">
          <Shield className="w-12 h-12 text-green-700 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Admin Access</h1>
          <p className="text-green-200 text-sm mb-6">Authorized personnel only</p>
          <SignInButton mode="modal" afterSignInUrl="/admin/dashboard">
            <button className="w-full px-6 py-3 bg-green-700 text-white rounded-xl font-medium hover:bg-green-800 transition-colors cursor-pointer">
              Admin Sign In
            </button>
          </SignInButton>
        </div>
      </div>
    </div>
  );
}
