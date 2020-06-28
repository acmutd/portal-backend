import { firestore } from "../admin/admin";

let stuff;

firestore
  .collection("cities")
  .doc("LA")
  .get()
  .then((snap) => {
    stuff = snap.data()?.state;
  })
  .catch((error) => {
    //do nothing
  });

exports.createTestDivision = (request: any, response: any) => {
  const data = JSON.parse(request.body);
  // Add a new document in collection "cities" with ID 'LA'
  firestore
    .collection("cities")
    .add(data)
    .then(() => {
      //success execution
      response.json(data); //sends a json
    })
    .catch((error: any) => {
      //failure execution
      response.send("You broke it");
    });
};
