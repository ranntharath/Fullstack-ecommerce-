"use client";
import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { adminStore } from "./store";
import { hydrateAuth } from "@/features/auth/authSlice";
import { readStoredAuth } from "@/features/auth/utils";

export default function AdminReduxProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const { user, accessToken } = readStoredAuth();

        adminStore.dispatch(hydrateAuth({
            user,
            accessToken,
        }));
    }, []);

    return <Provider store={adminStore}>{children}</Provider>;
}
