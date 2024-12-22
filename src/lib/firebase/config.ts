import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import type { FirebaseConfig } from "@/lib/types/store";

let app = getApps().length ? getApp() : null;
let auth = app ? getAuth(app) : null;
let db = app ? getFirestore(app) : null;

export function initializeFirebase(config: FirebaseConfig) {
    if (!app) {
        app = initializeApp(config);
        auth = getAuth(app);
        db = getFirestore(app);
    }
    return { app, auth, db };
}

export function getFirebase() {
    if (!app || !auth || !db) {
        throw new Error("Firebase not initialized");
    }
    return { app, auth, db };
}
