"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User, UserCredential } from "firebase/auth";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged } from "firebase/auth";
import { useAppConfig } from "@/context/app-config";
import { initializeFirebase, getFirebase } from "@/lib/firebase/config";

interface AuthContextValue {
    user: User | null;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<UserCredential>;
    signUp: (email: string, password: string) => Promise<UserCredential>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function LoadingScreen() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="space-y-4 text-center">
                <div className="text-4xl font-bold">Cashflow</div>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto" />
            </div>
        </div>
    );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { firebaseConfig, isLoading: isConfigLoading } = useAppConfig();

    useEffect(() => {
        if (isConfigLoading || !firebaseConfig) {
            return;
        }

        const { auth } = initializeFirebase(firebaseConfig);
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [firebaseConfig, isConfigLoading]);

    const signIn = async (email: string, password: string) => {
        const { auth } = getFirebase();
        return await signInWithEmailAndPassword(auth, email, password);
    };

    const signUp = async (email: string, password: string) => {
        const { auth } = getFirebase();
        return await createUserWithEmailAndPassword(auth, email, password);
    };

    const signOut = async () => {
        const { auth } = getFirebase();
        await firebaseSignOut(auth);
    };

    // Show loading screen while initializing auth
    if (isLoading || isConfigLoading) {
        return <LoadingScreen />;
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                signIn,
                signUp,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}
