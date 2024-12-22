"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/context/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { getDb } from "@/lib/firebase/config";

interface UserData {
    displayName: string;
    email: string | null;
    photoURL: string | null;
    updatedAt: string;
}

interface UserContextType {
    userData: UserData | null;
    isLoading: boolean;
    error: Error | null;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!user) {
            setUserData(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const db = getDb();
        const userDoc = doc(db, "users", user.uid);

        const unsubscribe = onSnapshot(
            userDoc,
            (doc) => {
                if (doc.exists()) {
                    setUserData(doc.data() as UserData);
                } else {
                    // If no user document exists, use Firebase Auth data
                    setUserData({
                        displayName: user.displayName || "",
                        email: user.email,
                        photoURL: user.photoURL,
                        updatedAt: new Date().toISOString(),
                    });
                }
                setIsLoading(false);
                setError(null);
            },
            (err) => {
                console.error("Failed to fetch user data:", err);
                setError(err as Error);
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user]);

    return (
        <UserContext.Provider
            value={{
                userData,
                isLoading,
                error,
            }}
        >
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
