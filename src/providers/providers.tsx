"use client";

import React from "react";
import {AuthProvider} from "@/providers/context/AuthContext";
import ReactQueryProvider from "@/providers/reactQuery/reactQuery";
import { Toaster } from "sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ReactQueryProvider>
        <Toaster richColors position="top-right" />
        {children}
      </ReactQueryProvider>
    </AuthProvider>
  );
}
