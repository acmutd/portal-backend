import { firestore } from "../admin/admin";
const admin = require('firebase-admin');

/**
 * Data object = ['docName string', 'permission string']
 */

async function createRole(request: any, response: any) {
    const data = JSON.parse(request.body);
    
    const docName = data[0]
    const permission = data[1]
    try{
      await firestore.collection("roles").doc(docName).set({
        permissions: admin.firestore.FieldValue.arrayUnion(permission) 
      });
      response.json(data)
    } catch(error){
      response.json("you broke it")
    }
  };

  /**
 * Data object = ['docName string', 'permission string']
 */

async function updateRole(request: any, response: any)  {
    const data = JSON.parse(request.body);
    
// updates a new document in collection "roles"
    const docName = data[0]
    const permission = data[1]
    try{
      await firestore.collection("roles").doc(docName).update({
        permissions: admin.firestore.FieldValue.arrayUnion(permission) 
      });
      response.json(data)
    } catch(error){
      response.json("you broke it")
    }
  };

   /**
 * Data object = ['docName string', 'permission string']
 */

async function deleteRole(request: any, response: any) {
  const data = JSON.parse(request.body);
    
  // deletes a certain document
      const docName = data[0]
      try{
        await firestore.collection("roles").doc(docName).delete(); 
        response.json(data)
      } catch(error){
        response.json("you broke it")
      }
};

async function readRole(request: any, response: any) {
  const data = JSON.parse(request.body);
    
  // deletes a certain document
      const docName = data[0]
      try{
        const rolesRef = firestore.collection("roles").doc(docName); 
        const doc = await rolesRef.get(); 
        if(!doc.exists){
          response.json("document does not exist")
        } 
        else{
          response.json(doc.data()); 
        }
      } catch(error){
        response.json("you broke it")
      }
};
  

  export { createRole, updateRole, deleteRole, readRole }; 