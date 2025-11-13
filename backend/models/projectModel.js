// models/projectModel.js
import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      default: null,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    // 'isAssigned' helps with stats and availability
    isAssigned: {
      type: Boolean,
      default: false,
    },
    origin: {
      type: String,
      enum: ['admin', 'proposal'], // admin = suggested, proposal = from student
      required: true,
      default: 'admin',
    },
    projectLink: {
      type: String, // For GitHub or live demo link
      trim: true,
      default: null,
    },
    documentationPath: {
      type: String, // For the path to the final PDF/DOCX
      trim: true,
      default: null,
    },
  },
  { timestamps: true }
);

const Project = mongoose.models.Project || mongoose.model("Project", projectSchema);
export default Project;