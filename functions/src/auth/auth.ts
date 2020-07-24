import { auth } from "../admin/admin";
import { Response, Request } from "express";

/**
 * Receive the {getAccessTokenSilently} from auth0
 */

export async function getCustomToken(request: Request, response: Response, next: (err?: Error) => void): Promise<void> {
  const { sub: uid } = request.user;

  try {
    const customToken = await auth.createCustomToken(uid);
    response.json({ firebaseToken: customToken });
  } catch (error) {
    next(error);
  }
}

export async function createTestUser(request: Request, response: Response): Promise<void> {
  try {
    const userRecord = await auth.createUser({
      email: "user@example.com",
      emailVerified: false,
      phoneNumber: "+11234567890",
      password: "secretPassword",
      displayName: "John Doe",
      photoURL: "http://www.example.com/12345678/photo.png",
      disabled: false,
    });

    // See the UserRecord reference doc for the contents of userRecord.
    console.log("Successfully created new user:", userRecord.uid);
    response.json(userRecord.toJSON());
  } catch (error) {
    console.log("Error creating new user:", error);
    response.send("Error creating new user");
  }
}
