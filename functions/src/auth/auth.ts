
import { auth } from "../admin/admin";

/**
 * Receive the {getTokenSilently} from auth0
 */
exports.createCustomToken = (request: any, response: any) => {
  const { sub: uid } = request.user;

  const firebaseToken = auth
    .createCustomToken(uid)
    .then((customToken) => {
      response.json({ firebaseToken });
    })
    .catch(function (error) {
      response.status(500).send({
        message: "Something went wrong acquiring a Firebase token.",
        error: error,
      });
      console.log("Error creating custom token:", error);
    });
};

exports.createTestUser = (request: any, response: any) => {
  auth
    .createUser({
      email: "user@example.com",
      emailVerified: false,
      phoneNumber: "+11234567890",
      password: "secretPassword",
      displayName: "John Doe",
      photoURL: "http://www.example.com/12345678/photo.png",
      disabled: false,
    })
    .then(function (userRecord) {
      // See the UserRecord reference doc for the contents of userRecord.
      console.log("Successfully created new user:", userRecord.uid);
    })
    .catch(function (error) {
      console.log("Error creating new user:", error);
    });
};
