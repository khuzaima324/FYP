import multer from "multer";
import path from "path";

// Set up storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/proposals/"); // Save in a 'proposals' subfolder
  },
  filename: function (req, file, cb) {
    // Create a unique filename
    cb(
      null,
      `proposal-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// Check file type
function checkFileType(file, cb) {
  const filetypes = /pdf/; // Only allow PDFs for one-pagers
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype === "application/pdf";

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Only PDF files are allowed!");
  }
}

// Init upload
const proposalUpload = multer({
  storage: storage,
  limits: { fileSize: 2000000 }, // 2MB limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("onePager"); // 'onePager' is the name of the <input type="file">

export default proposalUpload;