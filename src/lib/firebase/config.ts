import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

interface FirebaseInstances {
    app: FirebaseApp;
    auth: Auth;
    db: Firestore;
}

let instances: FirebaseInstances | null = null;

export interface FirebaseConfig {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
}

export function initializeFirebase(config: FirebaseConfig): FirebaseInstances {
    if (instances) return instances;

    try {
        const app = initializeApp(config);
        const auth = getAuth(app);
        const db = getFirestore(app);

        instances = { app, auth, db };
        return instances;
    } catch (error) {
        console.error("Error initializing Firebase:", error);
        throw error;
    }
}

export function getFirebase(): FirebaseInstances {
    if (!instances) {
        throw new Error("Firebase not initialized. Call initializeFirebase first.");
    }

    return instances;
}

// Export individual instances for convenience
export function getDb(): Firestore {
    return getFirebase().db;
}

export function getFirebaseAuth(): Auth {
    return getFirebase().auth;
}
