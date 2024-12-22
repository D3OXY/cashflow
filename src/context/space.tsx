"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/context/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { getDb } from "@/lib/firebase/config";
import type { Space } from "@/lib/types/space";
import type { CreateSpaceData } from "@/lib/firebase/spaces";
import { createSpaceInDb } from "@/lib/firebase/spaces";

interface SpaceContextType {
    spaces: Space[];
    currentSpace: Space | null;
    isLoading: boolean;
    error: Error | null;
    switchSpace: (spaceId: string) => void;
    createNewSpace: (data: CreateSpaceData) => Promise<Space>;
    refreshSpaces: () => Promise<void>;
}

const SpaceContext = createContext<SpaceContextType | null>(null);

export function SpaceProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [currentSpaceId, setCurrentSpaceId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Derive currentSpace from spaces and currentSpaceId
    const currentSpace = currentSpaceId ? spaces.find((s) => s.id === currentSpaceId) || null : spaces[0] || null;

    useEffect(() => {
        if (!user) {
            setSpaces([]);
            setCurrentSpaceId(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const db = getDb();
        const spacesQuery = query(collection(db, "spaces"), where("userId", "==", user.uid));

        const unsubscribe = onSnapshot(
            spacesQuery,
            (snapshot) => {
                const updatedSpaces = snapshot.docs.map(
                    (doc) =>
                        ({
                            id: doc.id,
                            ...doc.data(),
                        } as Space)
                );

                setSpaces(updatedSpaces);

                // If no current space is selected and we have spaces, select the first one
                if (!currentSpaceId && updatedSpaces.length > 0) {
                    setCurrentSpaceId(updatedSpaces[0].id);
                }
                // If current space no longer exists, switch to the first available space
                else if (currentSpaceId && !updatedSpaces.find((s) => s.id === currentSpaceId)) {
                    setCurrentSpaceId(updatedSpaces.length > 0 ? updatedSpaces[0].id : null);
                }

                setIsLoading(false);
                setError(null);
            },
            (err) => {
                console.error("Failed to fetch spaces:", err);
                setError(err as Error);
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user, currentSpaceId]);

    const switchSpace = (spaceId: string) => {
        setCurrentSpaceId(spaceId);
    };

    const createNewSpace = async (data: CreateSpaceData) => {
        if (!user) throw new Error("No user logged in");
        const newSpace = await createSpaceInDb(data, user.uid);
        return newSpace;
    };

    const refreshSpaces = async () => {
        // The onSnapshot listener will automatically handle updates
        // This function exists for backwards compatibility
    };

    return (
        <SpaceContext.Provider
            value={{
                spaces,
                currentSpace,
                isLoading,
                error,
                switchSpace,
                createNewSpace,
                refreshSpaces,
            }}
        >
            {children}
        </SpaceContext.Provider>
    );
}

export function useSpace() {
    const context = useContext(SpaceContext);
    if (!context) {
        throw new Error("useSpace must be used within a SpaceProvider");
    }
    return context;
}
