import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    groupName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      default: null,
    },
  },
  { timestamps: true }
);

// Prevent OverwriteModelError
const Group = mongoose.models.Group || mongoose.model("Group", groupSchema);
export default Group;
