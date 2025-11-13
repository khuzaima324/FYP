import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "uploads/documentation/";

// Ensure the directory exists
fs.mkdirSync(uploadDir, { recursive: true });

// Set up storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Save in 'uploads/documentation/'
  },
  filename: function (req, file, cb) {
    // Create a unique filename
    cb(
      null,
      `doc-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// Check file type
function checkFileType(file, cb) {
  // Allow PDF, DOC, DOCX
  const filetypes = /pdf|doc|docx/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = /pdf|msword|vnd.openxmlformats-officedocument.wordprocessingml.document/.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    // cb("Error: Only PDF or Word (doc, docx) files are allowed!");
    cb(null, false); // Reject file silently
  }
}

// Init upload
const documentationUpload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("documentation"); // 'documentation' is the name of the <input>

export default documentationUpload;