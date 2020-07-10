import { firestore } from "../admin/admin";
//const admin = require('firebase-admin')

/** 
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
  */

exports.createDivision = (request: any, response: any) => {
  const data = JSON.parse(request.body);
  // Add a new document in collection "divisions"
  firestore
    .collection("divisions")
    .doc(data.docName)
    .set(data)
    .then(() => {
      //success execution
      response.json(data); //sends a json
    })
    .catch((error: any) => {
      //failure execution
      response.send("You broke it");
    });
};

exports.updateDivision = (request: any, response: any) => {
  const data = JSON.parse(request.body);
  
  //updates certain document 
  firestore
    .collection("divisions")
    .doc(data.docName)
    .update(data)
    .then(() => {
      //success execution
      response.json(data); //sends a json
    })
    .catch((error: any) => {
      //failure execution
      response.send("You broke it");
    });
};

/**
 * Data type:
 * const data = [ 'uid' , {
      docName: "hack-utd",
      title: "Director",
    }];
 */

exports.addStaffMember = (request: any, response: any) => {
  const data = JSON.parse(request.body);

  //user.sub to retrieve the uiud of specific user 
  const uid = data[0]
  const body = data[1]
  
  //updates certain document 
  firestore
    .collection("divisions")
    .doc("hack-utd")
    .update({
       //staff: admin.firestore.FieldValue.arrayUnion(data)
       ['staff.' + uid] : body
    })
    .then(() => {
      //success execution
      response.json(data); //sends a json
    })
    .catch((error: any) => {
      //failure execution
      response.send("You broke it");
    });
};

exports.updateStaffMember = (request: any, response: any) => {
  const data = JSON.parse(request.body);

  const uid = data[0]
  const body = data[1]
  
  //updates certain document 
  firestore
    .collection("divisions")
    .doc("hack-utd")
    .update({
       //staff: admin.firestore.FieldValue.arrayUnion(data)
       ['staff.' + uid] : body
    })
    .then(() => {
      //success execution
      response.json(data); //sends a json
    })
    .catch((error: any) => {
      //failure execution
      response.send("You broke it");
    });
};




// exports.readDivision = (request: any, response: any) => {
//   // const data = JSON.parse(request.body);

//   firestore
//     .collection("divisions")
//     .doc()
//     .get()
//     .then(snap =>
//       response.json(snap.data()))
//     .catch((error: any) => {
//       //failure execution
//       response.send("You broke it");
//     });
// };
  



