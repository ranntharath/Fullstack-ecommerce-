"use client";
import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { clientStore } from "./store";
import { hydrateAuth } from "@/features/auth/authSlice";
import { readStoredAuth } from "@/features/auth/utils";

export default function ClientReduxProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const { user, accessToken } = readStoredAuth();

        clientStore.dispatch(hydrateAuth({
            user,
            accessToken,
        }));
    }, []);

    return <Provider store={clientStore}>{children}</Provider>;
}
