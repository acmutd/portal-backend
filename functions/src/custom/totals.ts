import * as functions from "firebase-functions";
import * as Sentry from "@sentry/node";
import logger from "../services/logging";
import { firestore } from "../admin/admin";
import { environment } from "../environment";
import admin from "firebase-admin";

const event_collection = environment.FIRESTORE_EVENT_COLLECTION as string;

export const computeCollectionTotals = firestore.listCollections().then(async (collections) => {
  const total: Record<string, number> = {};
  const collectionTotalRef = firestore.collection("total").doc("collection_total");

  for (const collection of collections) {
    const collectionId = collection.id;
    collection.listDocuments().then((documents) => {
      total[collectionId] = documents.length;
    });
    try {
      await collectionTotalRef.update(total);
      logger.log({
        total,
        message: `Total number of documents in collection ${collectionId} is ${total[collectionId]}`,
      });
    } catch (error) {
      Sentry.captureException(error);
      logger.log(`Failed to fetch total number of documents in collection ${collectionId}`);
    }
  }
});

export const onCreateDocumentTrigger = functions.firestore
  .document("{collectionId}/{docId}")
  .onCreate(async (docSnapshot) => {
    const documentId = docSnapshot.id;
    const collectionTotalRef = firestore.collection("total").doc("collection_total");

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
  const collectionTotalRef = firestore.collection("total").doc("collection_total");

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

export const fetchParticipantCount = firestore
  .collection(event_collection)
  .listDocuments()
  .then(async (documents) => {
    const attendanceCountForDocument: Record<string, number> = {};
    const eventTotalRef = firestore.collection("total").doc("event");

    for (const document of documents) {
      const documentRef = await document.get();
      const attendanceCount = documentRef.get("attendance").length;
      attendanceCountForDocument[documentRef.id] = attendanceCount;

      try {
        await eventTotalRef.update(attendanceCountForDocument);
        logger.log({
          attendanceCountForDocument,
          message: `Total attendance for event ${documentRef.id} is ${attendanceCount}`,
        });
      } catch (error) {
        Sentry.captureException(error);
        logger.log(`Failed to fetch total attendance for event ${documentRef.id}`);
      }
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
        await firestore.collection("total").doc("event").update(updatedTotal);
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
