import { firestore } from "../admin/admin";
const admin = require('firebase-admin');

/**
 * Data object = ['docName string', 'permission string']
 */

exports.createRole = (request: any, response: any) => {
    const data = JSON.parse(request.body);
    
    const docName = data[0]
    const permission = data[1]
    // Add a new document in collection "roles"
    firestore
      .collection("roles")
      .doc(docName)
      .set({
          permissions: admin.firestore.FieldValue.arrayUnion(permission)   
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

  /**
 * Data object = ['docName string', 'permission string']
 */

  exports.updateRole = (request: any, response: any) => {
    const data = JSON.parse(request.body);
    
// updates a new document in collection "roles"
    const docName = data[0]
    const permission = data[1]
    firestore
      .collection("roles")
      .doc(docName)
      .update({
          permissions: admin.firestore.FieldValue.arrayUnion(permission)   
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

   /**
 * Data object = ['docName string', 'permission string']
 */

  exports.deleteRole = (request: any, response: any) => {
    const data = JSON.parse(request.body);
    
    //deletes a certain document
    firestore
      .collection("divisions")
      .doc(data.docName)
      .delete()
      .then(() => {
        //success execution
        response.json("document deleted"); //sends a json
      })
      .catch((error: any) => {
        //failure execution
        response.send("You broke it");
      });
  };