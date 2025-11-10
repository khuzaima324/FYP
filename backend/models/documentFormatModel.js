import mongoose from "mongoose";

const documentFormatSchema = new mongoose.Schema(
  {
    // "Proposal", "One Pager", or "Documentation"
    fileType: {
      type: String,
      required: true,
      unique: true, // Only one "Proposal" format at a time
      enum: ["Proposal", "One Pager", "Documentation"],
    },
    // The user-friendly name (e.g., "proposal_format_v2.pdf")
    fileName: {
      type: String,
      required: true,
    },
    // The server path (e.g., "/uploads/proposal-1678886.pdf")
    filePath: {
      type: String,
      required: true,
    },
    // Admin who uploaded it
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const DocumentFormat =
  mongoose.models.DocumentFormat ||
  mongoose.model("DocumentFormat", documentFormatSchema);
export default DocumentFormat;