import * as Mongoose from "mongoose";
import { environment } from "../environment";

let database: Mongoose.Connection;

const mongo_connection_uri = environment.MONGO_CONNECTION_URL as string;

export const connectMongo = (): void => {
  if (database) {
    return;
  }

  const options = {
    autoIndex: false,
    minPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
  };
  Mongoose.connect(mongo_connection_uri, options);

  database = Mongoose.connection;

  database.once("open", async () => {
    console.log("Portal successfully connected to database.");
  });
  database.once("disconnected", async () => {
    console.log("Portal successfully disconnected to database.");
  });
  database.on("error", () => {
    console.log("Error connecting/processing data from database.");
  });
};

export const disconnectMongo = (): void => {
  if (!database) {
    return;
  }

  Mongoose.disconnect();
};
