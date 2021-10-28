// Import necessary modules
import * as Sentry from "@sentry/node";
import { firestore } from "../admin/admin";
import logger from "../logging";
import { environment } from "../environment";

// Import necessary env variables from Doppler
const event_collection = environment.FIRESTORE_EVENT_COLLECTION as string;
const totals_collection = environment.FIRESTORE_TOTALS_COLLECTION as string;
const totals_doc = environment.FIRESTORE_TOTALS_DOC as string;
const total_event_current_semester_doc = environment.FIRESTORE_TOTAL_EVENTS_DOC as string;

// Compute totals of all documents in collections for acm-core Firestore
export const computeCollectionTotals = async (): Promise<void> => {
  // Get a reference to all collections via Promise
  firestore.listCollections().then(async (collections) => {
    // Stores the total number of documents, string represents collection, number represents documents
    const total: Record<string, number> = {};
    // Get reference to totals collection
    const collectionTotalRef = firestore.collection(totals_collection).doc(totals_doc);

    // Iterate through all collections
    for (const collection of collections) {
      const collectionId = collection.id;
      // Get a reference to all documents for particular collection
      collection
        .listDocuments()
        .then((documents) => {
          total[collectionId] = documents.length;
        })
        .then(async () => {
          // Update totals doc with object containing document totals after
          // fetching all document references
          try {
            await collectionTotalRef.update(total);
            logger.log(`Total number of documents in collection ${collectionId} is ${total[collectionId]}`);
          } catch (error) {
            Sentry.captureException(error);
            logger.log(`Failed to fetch total number of documents in collection ${collectionId}`);
          }
        });
    }
  });
};

// Fetch participant count script
export const fetchParticipantCount = async (): Promise<void> => {
  // Get a reference to all documents from Firestore
  firestore
    .collection(event_collection)
    .listDocuments()
    .then(async (documents) => {
      // Init a new object to count attendance for each document in current semester's event data
      const attendanceCountForDocument: Record<string, number> = {};
      // Get a reference to where this semester's attendance totals are stored
      const eventTotalRef = firestore.collection(totals_collection).doc(total_event_current_semester_doc);

      // Iterate over all documents
      for (const document of documents) {
        // Get a reference to current document
        const documentRef = await document.get();
        // If the document has data then fetch its attendance
        if (documentRef.data()) {
          const docData = documentRef.data() as FirebaseFirestore.DocumentData;
          if (docData.attendance) {
            // Get the length of the attendance array field
            const attendanceCount = docData.attendance.length;
            // For the particular document's ID, update the attendance count
            attendanceCountForDocument[documentRef.id] = attendanceCount;

            try {
              // Update the event totals with object storing semester's attendance data
              await eventTotalRef.update(attendanceCountForDocument);
              logger.log(`Total checked-in event attendance for event ${documentRef.id} is ${attendanceCount}`);
            } catch (error) {
              Sentry.captureException(error);
              logger.log(`Failed to fetch total checked-in event attendance for event ${documentRef.id}`);
            }
          }
        }
      }
    });
};
