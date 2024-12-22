"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Space } from "@/lib/types/space";
import { createSpace, getUserSpaces, CreateSpaceData } from "@/lib/firebase/spaces";
import { useAuth } from "./auth";

interface SpaceContextType {
    spaces: Space[];
    currentSpace: Space | null;
    loading: boolean;
    error: Error | null;
    createNewSpace: (data: CreateSpaceData) => Promise<Space>;
    switchSpace: (spaceId: string) => void;
    refreshSpaces: () => Promise<void>;
}

const SpaceContext = createContext<SpaceContextType | null>(null);

export function SpaceProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [currentSpace, setCurrentSpace] = useState<Space | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Load user's spaces
    useEffect(() => {
        if (!user) {
            setSpaces([]);
            setCurrentSpace(null);
            setLoading(false);
            return;
        }

        loadSpaces();
    }, [user]);

    // Set current space when spaces change
    useEffect(() => {
        if (spaces.length > 0 && !currentSpace) {
            setCurrentSpace(spaces[0]);
        }
    }, [spaces, currentSpace]);

    const loadSpaces = async () => {
        try {
            setLoading(true);
            setError(null);
            const userSpaces = await getUserSpaces();
            setSpaces(userSpaces);
        } catch (err) {
            console.error("Failed to load spaces:", err);
            setError(err instanceof Error ? err : new Error("Failed to load spaces"));
        } finally {
            setLoading(false);
        }
    };

    const createNewSpace = async (data: CreateSpaceData) => {
        try {
            const newSpace = await createSpace(data);
            setSpaces((prev) => [...prev, newSpace]);
            if (!currentSpace) {
                setCurrentSpace(newSpace);
            }
            return newSpace;
        } catch (err) {
            console.error("Failed to create space:", err);
            throw err instanceof Error ? err : new Error("Failed to create space");
        }
    };

    const switchSpace = (spaceId: string) => {
        const space = spaces.find((s) => s.id === spaceId);
        if (space) {
            setCurrentSpace(space);
        }
    };

    const refreshSpaces = async () => {
        await loadSpaces();
    };

    return (
        <SpaceContext.Provider
            value={{
                spaces,
                currentSpace,
                loading,
                error,
                createNewSpace,
                switchSpace,
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
