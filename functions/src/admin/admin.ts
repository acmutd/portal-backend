import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";

/**
 * Initialize firebase admin sdk
 */
const app = admin.initializeApp();

/**
 * Various exports, when needing to use additional functionality add them as exports here
 */
export const auth = app.auth();
export const firestore = app.firestore();

