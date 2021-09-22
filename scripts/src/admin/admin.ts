import admin from "firebase-admin";

/**
 * Initialize firebase admin sdk
 */
const app = admin.initializeApp();

/**
 * Various exports, when needing to use additional functionality add them as exports here
 */
export const firestore = app.firestore();
