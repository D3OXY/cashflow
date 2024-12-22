"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { getDb } from "@/lib/firebase/config";
import type { Space } from "@/lib/types/space";
import { createSpace as createSpaceInDb } from "@/lib/firebase/spaces";
import type { CreateSpaceData } from "@/lib/firebase/spaces";

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
    const [currentSpace, setCurrentSpace] = useState<Space | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Set up real-time listener for spaces
    useEffect(() => {
        if (!user) {
            setSpaces([]);
            setCurrentSpace(null);
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

                // Update current space if it exists in the updated spaces
                if (currentSpace) {
                    const updatedCurrentSpace = updatedSpaces.find((s) => s.id === currentSpace.id);
                    if (updatedCurrentSpace) {
                        setCurrentSpace(updatedCurrentSpace);
                    } else if (updatedSpaces.length > 0) {
                        // If current space no longer exists, switch to the first available space
                        setCurrentSpace(updatedSpaces[0]);
                    } else {
                        setCurrentSpace(null);
                    }
                } else if (updatedSpaces.length > 0) {
                    setCurrentSpace(updatedSpaces[0]);
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const switchSpace = (spaceId: string) => {
        const space = spaces.find((s) => s.id === spaceId);
        if (space) {
            setCurrentSpace(space);
        }
    };

    const createNewSpace = async (data: CreateSpaceData) => {
        if (!user) throw new Error("No user logged in");
        const newSpace = await createSpaceInDb(data);
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
