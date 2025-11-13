import mongoose from "mongoose";

const pastProjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: false },
    session: { type: String, required: true, trim: true }, // e.g., "2021-2025"
    supervisorName: { type: String, required: false }, // Storing name is safer for an archive
    department: { type: String, required: true, trim: true }, // Optional department field
    groupName: { type: String, required: false, default: null}, // Optional group name
    studentRollNumbers: [{ type: String }], // Store as an array of roll numbers
    studentNames: [{ type: String }], // Store as an array of names
    projectLink: { type: String, trim: true }, // Optional link to GitHub or report
  },
  { timestamps: true }
);

const PastProject =
  mongoose.models.PastProject ||
  mongoose.model("PastProject", pastProjectSchema);
export default PastProject;