import * as Sentry from "@sentry/node";
import { firestore } from "../admin/admin";
import { environment } from "../environment";

const event_collection = environment.FIRESTORE_EVENT_COLLECTION as string;
const totals_collection = environment.FIRESTORE_TOTALS_COLLECTION as string;
const totals_doc = environment.FIRESTORE_TOTALS_DOC as string;
const total_event_current_semester_doc = environment.FIRESTORE_TOTAL_EVENTS_DOC as string;

export const computeCollectionTotals = async (): Promise<void> => {
  firestore.listCollections().then(async (collections) => {
    const total: Record<string, number> = {};
    const collectionTotalRef = firestore.collection(totals_collection).doc(totals_doc);

    for (const collection of collections) {
      const collectionId = collection.id;
      collection
        .listDocuments()
        .then((documents) => {
          total[collectionId] = documents.length;
        })
        .then(async () => {
          try {
            await collectionTotalRef.update(total);
            console.log(`Total number of documents in collection ${collectionId} is ${total[collectionId]}`);
          } catch (error) {
            Sentry.captureException(error);
            console.log(`Failed to fetch total number of documents in collection ${collectionId}`);
          }
        });
    }
  });
};

export const fetchParticipantCount = async (): Promise<void> => {
  firestore
    .collection(event_collection)
    .listDocuments()
    .then(async (documents) => {
      const attendanceCountForDocument: Record<string, number> = {};
      const eventTotalRef = firestore.collection(totals_collection).doc(total_event_current_semester_doc);

      for (const document of documents) {
        const documentRef = await document.get();
        if (documentRef.data()) {
          const docData = documentRef.data() as FirebaseFirestore.DocumentData;
          if (docData.attendance) {
            const attendanceCount = docData.attendance.length;
            attendanceCountForDocument[documentRef.id] = attendanceCount;

            try {
              await eventTotalRef.update(attendanceCountForDocument);
              console.log(`Total checked-in event attendance for event ${documentRef.id} is ${attendanceCount}`);
            } catch (error) {
              Sentry.captureException(error);
              console.log(`Failed to fetch total checked-in event attendance for event ${documentRef.id}`);
            }
          }
        }
      }
    });
};
