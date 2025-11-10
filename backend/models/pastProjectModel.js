import mongoose from "mongoose";

const pastProjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    session: { type: String, required: true, trim: true }, // e.g., "2021-2025"
    supervisorName: { type: String, required: true }, // Storing name is safer for an archive
    studentNames: [{ type: String }], // Store as an array of names
    projectLink: { type: String, trim: true }, // Optional link to GitHub or report
  },
  { timestamps: true }
);

const PastProject =
  mongoose.models.PastProject ||
  mongoose.model("PastProject", pastProjectSchema);
export default PastProject;