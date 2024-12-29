import { LazyStore } from "@tauri-apps/plugin-store";
import type { Store, StoreKeys, AppConfig } from "@/lib/types/store";

const STORE_PATH = "app-store.json";

class AppStore {
    private store: LazyStore;
    private static instance: AppStore;

    private constructor() {
        this.store = new LazyStore(STORE_PATH);
    }

    public static getInstance(): AppStore {
        if (!AppStore.instance) {
            AppStore.instance = new AppStore();
        }
        return AppStore.instance;
    }

    async get<K extends StoreKeys>(key: K): Promise<Store[K] | null> {
        try {
            const value = await this.store.get<Store[K]>(key);
            return value ?? null;
        } catch {
            return null;
        }
    }

    async set<K extends StoreKeys>(key: K, value: Store[K]): Promise<void> {
        await this.store.set(key, value);
        await this.store.save();
    }

    async getAppConfig(): Promise<AppConfig | null> {
        return this.get("app-config");
    }

    async setAppConfig(config: AppConfig): Promise<void> {
        return this.set("app-config", config);
    }

    async isInitialized(): Promise<boolean> {
        const config = await this.getAppConfig();
        return Boolean(config?.isInitialized && config?.firebase);
    }

    async reset(): Promise<void> {
        await this.store.clear();
        await this.store.save();
    }
}

export const appStore = AppStore.getInstance();
