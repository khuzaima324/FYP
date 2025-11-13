import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "uploads/proposals/"; // Can save in the same folder

// Ensure the directory exists
fs.mkdirSync(uploadDir, { recursive: true });

// Set up storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Give it a different name
    cb(
      null,
      `full-proposal-${Date.now()}${path.extname(file.originalname)}`
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
    cb("Error: Only PDF or Word (doc, docx) files are allowed!");
  }
}

// Init upload
const fullProposalUpload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("proposalFile"); // ✅ LOOKS FOR "proposalFile"

export default fullProposalUpload;