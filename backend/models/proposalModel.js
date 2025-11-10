// models/proposalModel.js
import mongoose from "mongoose";

const proposalSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
      },
    ],
    // The supervisor they are proposing
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Proposal = mongoose.models.Proposal || mongoose.model("Proposal", proposalSchema);
export default Proposal;