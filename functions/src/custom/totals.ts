import * as functions from "firebase-functions";
import * as Sentry from "@sentry/node";
import logger from "../services/logging";
import { firestore } from "../admin/admin";
import { environment } from "../environment";
import admin from "firebase-admin";

const event_collection = environment.FIRESTORE_EVENT_COLLECTION as string;
const totals_collection = environment.FIRESTORE_TOTALS_COLLECTION as string;
const totals_doc = environment.FIRESTORE_TOTALS_DOC as string;

export const onCreateDocumentTrigger = functions.firestore
  .document("{collectionId}/{docId}")
  .onCreate(async (docSnapshot) => {
    const documentId = docSnapshot.id;
    const collectionTotalRef = firestore.collection(totals_collection).doc(totals_doc);

    if (collectionTotalRef.id === documentId) {
      // Do not infinitely update the totals document
      return;
    }

    const total: Record<string, admin.firestore.FieldValue> = {};
    total[documentId] = admin.firestore.FieldValue.increment(1);

    try {
      await collectionTotalRef.update(total);
      logger.log({
        total,
        message: `Incrementing total number of documents in collection ${docSnapshot.ref.path}`,
      });
    } catch (error) {
      Sentry.captureException(error);
      logger.log(`Failed to increment total number of documents in collection ${docSnapshot.ref.path}`);
    }
  });

export const onWriteDocumentTrigger = functions.firestore.document("{collectionId}/{docId}").onWrite(async (change) => {
  const documentId = change.after.id;
  const collectionTotalRef = firestore.collection(totals_collection).doc(totals_doc);

  if (collectionTotalRef.id === documentId) {
    // Do not infinitely update the totals document
    return;
  }

  const total: Record<string, admin.firestore.FieldValue> = {};
  total[documentId] = admin.firestore.FieldValue.increment(1);

  try {
    await collectionTotalRef.update(total);
    logger.log({
      total,
      message: `Incrementing total number of documents in collection ${change.after.ref.path}`,
    });
  } catch (error) {
    Sentry.captureException(error);
    logger.log(`Failed to increment total number of documents in collection ${change.after.ref.path}`);
  }
});

export const updateAttendanceTrigger = functions.firestore
  .document(`${event_collection}/{eventName}`)
  .onUpdate(async (change) => {
    const newAttendance = change.after.data().attendance.length;
    const previousAttendance = change.before.data().attendance.length;

    const updatedTotal: Record<string, number> = {};
    if (newAttendance > previousAttendance) {
      updatedTotal[change.after.id] = newAttendance;
      try {
        await firestore.collection(totals_collection).doc("event").update(updatedTotal);
        logger.log({
          updatedTotal,
          message: `Updated total attendance for event ${change.after.id} is ${newAttendance}`,
        });
      } catch (error) {
        Sentry.captureException(error);
        logger.log(`Failed to update total attendance for event ${change.after.id}`);
      }
    }
  });
