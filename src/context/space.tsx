"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/context/auth";
import type { Space } from "@/lib/types/space";
import { createSpace, getUserSpaces, getSpace } from "@/lib/firebase/spaces";
import { appStore } from "@/lib/tauri-store";
import type { Store } from "@/lib/types/store";

interface SpaceContextValue {
    spaces: Space[];
    currentSpace: Space | null;
    isLoading: boolean;
    createNewSpace: (data: Partial<Space>) => Promise<Space>;
    switchSpace: (spaceId: string) => Promise<void>;
    refreshSpaces: () => Promise<void>;
}

const SpaceContext = createContext<SpaceContextValue | null>(null);

export function SpaceProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [currentSpace, setCurrentSpace] = useState<Space | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadSpaces = async () => {
        if (!user) {
            setSpaces([]);
            setCurrentSpace(null);
            setIsLoading(false);
            return;
        }

        try {
            const userSpaces = await getUserSpaces(user.uid);
            setSpaces(userSpaces);

            // Load last used space from store
            const state = (await appStore.get<"space-state">("space-state")) as Store["space-state"];
            const lastSpaceId = state?.lastSpaceId;

            if (lastSpaceId && userSpaces.some((space) => space.id === lastSpaceId)) {
                const space = await getSpace(user.uid, lastSpaceId);
                setCurrentSpace(space);
            } else if (userSpaces.length > 0) {
                setCurrentSpace(userSpaces[0]);
                await appStore.set("space-state", { lastSpaceId: userSpaces[0].id });
            }
        } catch (error) {
            console.error("Failed to load spaces:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadSpaces();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const createNewSpace = async (data: Partial<Space>) => {
        if (!user) throw new Error("User not authenticated");

        const newSpace = await createSpace(user.uid, data);
        setSpaces((prev) => [newSpace, ...prev]);

        if (!currentSpace) {
            setCurrentSpace(newSpace);
            await appStore.set("space-state", { lastSpaceId: newSpace.id });
        }

        return newSpace;
    };

    const switchSpace = async (spaceId: string) => {
        if (!user) throw new Error("User not authenticated");

        const space = await getSpace(user.uid, spaceId);
        if (!space) throw new Error("Space not found");

        setCurrentSpace(space);
        await appStore.set("space-state", { lastSpaceId: spaceId });
    };

    const refreshSpaces = async () => {
        await loadSpaces();
    };

    return (
        <SpaceContext.Provider
            value={{
                spaces,
                currentSpace,
                isLoading,
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
        throw new Error("useSpace must be used within SpaceProvider");
    }
    return context;
}
