import DocumentFormat from "../models/documentFormatModel.js";
import fs from "fs"; // File System, needed for deleting old files

// @desc    Upload or Replace a document format
// @route   POST /api/document-formats
export const uploadFormat = async (req, res) => {
  const { fileType } = req.body;
  if (!fileType) {
    return res.status(400).json({ message: "File type is required" });
  }
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    // Check if a document of this type already exists
    const existingDoc = await DocumentFormat.findOne({ fileType: fileType });

    if (existingDoc) {
      // 1. Delete the old file from the server
      fs.unlink(existingDoc.filePath, (err) => {
        if (err) console.error("Error deleting old file:", err);
      });
      // 2. Update the database entry
      existingDoc.fileName = req.file.originalname;
      existingDoc.filePath = req.file.path;
      existingDoc.uploadedBy = req.user._id;
      await existingDoc.save();
      res.json(existingDoc);
    } else {
      // Create a new entry
      const newDoc = await DocumentFormat.create({
        fileType: fileType,
        fileName: req.file.originalname,
        filePath: req.file.path,
        uploadedBy: req.user._id,
      });
      res.status(201).json(newDoc);
    }
  } catch (error) {
    res.status(500).json({ message: "Error uploading file", error });
  }
};

// @desc    Get all document formats
// @route   GET /api/document-formats
export const getFormats = async (req, res) => {
  try {
    const formats = await DocumentFormat.find();
    res.json(formats);
  } catch (error) {
    res.status(500).json({ message: "Error fetching formats", error });
  }
};