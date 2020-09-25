import { firestore } from "../admin/admin";

export const getTag = async (request: any, response: any): Promise<void> => {
  firestore
    .collection("challenge")
    .where("name", "==", request.params.tag)
    .get()
    .then((document) => {
      if (document.size === 0) {
        response.status(403).json({ message: `no tag with name ${request.params.tag} exists` });
      }
      const doc = document.docs[0].data();
      response.json({
        name: doc.name,
        contents: doc.contents,
      });
    });
};

export const createTag = async (request: any, response: any): Promise<void> => {
  const tagData = request.body;
  if (!tagData.name) {
    response.status(404).json({ message: `name missing` });
  }
  if (!tagData.contents) {
    response.status(404).json({ message: `contents missing` });
  }
  if (tagData.name !== request.params.tag) {
    response.status(403).json({ message: `body name and query param name are not identical` });
  }
  firestore
    .collection("challenge")
    .add({
      name: tagData.name,
      contents: tagData.contents,
    })
    .then((docRef) => {
      response.json({
        name: tagData.name,
        contents: tagData.contents,
        token: docRef.id,
      });
    });
};

export const patchTag = async (request: any, response: any): Promise<void> => {
  const tagData = request.body;
  if (!tagData.contents) {
    response.status(404).json({ message: `contents missing` });
  }

  firestore
    .collection("challenge")
    .where("name", "==", request.params.tag)
    .get()
    .then((document) => {
      if (document.size === 0) {
        response.status(404).json({ message: `no tag with name ${request.params.tag} exists` });
      }
      const doc = document.docs[0];
      if (doc.id !== request.params.token) {
        response.status(403).json({ message: `invalid token` });
      } else {
        firestore.collection("challenge").doc(request.params.token).update({
          contents: tagData.contents,
        });
        response.json({
          name: tagData.name,
          contents: tagData.contents,
        });
      }
    });
};

export const deleteTag = async (request: any, response: any): Promise<void> => {
  firestore
    .collection("challenge")
    .where("name", "==", request.params.tag)
    .get()
    .then((document) => {
      if (document.size === 0) {
        response.status(404).json({ message: `no tag with name ${request.params.tag} exists` });
      }
      const doc = document.docs[0];
      if (doc.id !== request.params.token) {
        response.status(403).json({ message: `invalid token` });
      } else {
        firestore.collection("challenge").doc(request.params.token).delete();
        response.status(200).send();
      }
    });
};
