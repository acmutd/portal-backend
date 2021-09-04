import { Response, Request } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { bucket_core } from '../admin/admin'

// The absolute path to the temporary resumes directory...
const RESUMES_DIRECTORY = path.join(__dirname, '..', '..', 'tmp', 'resumes');
// Multer storage object for file uploads...
const multer_storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Set the upload destination to the local resume storage directory for consistent access...
    cb(null, RESUMES_DIRECTORY);
  },
  filename: function (req, file, cb) {
    // Generate the filename using the user ID and the original file extension...
    // This preserves unique naming and original file formats...
    cb(null, req.body.userID + path.extname(file.originalname));
  }
});

/**
 * Handles a basic POST request for a resume upload from the portal frontend using multer.
 * @param request Request
 * @param response Response
 */
export const upload_resume = (request: Request, response: Response): void => {
  // Create the temporary local resume storage directory...
  fs.mkdir(RESUMES_DIRECTORY, () => console.log('Setup complete for local resume directory...'));
  // Create a callback function to handle the multer upload (form file field is 'resume')...
  const multer_upload = multer({ storage: multer_storage }).single('resume');
  /**
   * Handles the multer upload.
   */
  multer_upload(request, response, function (err) {
    // If the file is missing or error, send the response...
    if (!request.file || err) {
      return response.send({
        error: "Missing or invalid file..."
      })
    }
    // The filename used in the GCP bucket and the local temporary store...
    const FILENAME = `${request.body.userID}${path.extname(request.file.originalname)}`
    // Upload the file to the GCP bucket. Once the upload is complete, delete the file from the local store...
    bucket_core.upload(path.join(RESUMES_DIRECTORY, FILENAME), {
      destination: `resumes/${FILENAME}`
    }).then(() => {
      // Delete the file from the local store...
      fs.rmdir(path.join(RESUMES_DIRECTORY, FILENAME), () => { });
    });
    // File upload succeeded...
    return response.send({
      success: "File upload succeeded..."
    });
  });
};