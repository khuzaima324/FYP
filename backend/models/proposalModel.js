// // models/proposalModel.js
// import mongoose from "mongoose";

// const proposalSchema = new mongoose.Schema(
//   {
//     title: { type: String, required: true, trim: true },
//     description: { type: String, required: true },
//     students: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Student",
//         required: true,
//       },
//     ],
//     // The supervisor they are proposing
//     supervisor: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Teacher",
//       default: null,
//     },
//     status: {
//       type: String,
//       enum: [
//         "pending_onepager", // Student submits one-pager
//         "pending_proposal", // Admin approves one-pager
//         "pending_final_approval", // Student submits full proposal
//         "approved", // Admin gives final approval
//         "rejected", // Admin rejects at any step
//       ],
//       default: "pending_onepager", // New default
//     },
//     onePagerPath: {
//       type: String,
//       required: true,
//     },
//     proposalFilePath: {
//       type: String, // For the full proposal (Step 2)
//       default: null,
//     },
//     originProject: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Project",
//       default: null,
//     },
//   },
//   { timestamps: true }
// );

// const Proposal =
//   mongoose.models.Proposal || mongoose.model("Proposal", proposalSchema);
// export default Proposal;



// models/proposalModel.js
import mongoose from "mongoose";

const proposalSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    
    // ✅ ADDED THIS FIELD so the auto-assigned name is actually saved
    groupName: { 
      type: String, 
      required: true 
    },

    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
      },
    ],
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      default: null,
    },
    status: {
      type: String,
      enum: [
        "pending_onepager",
        "pending_proposal",
        "pending_final_approval",
        "approved",
        "rejected",
      ],
      default: "pending_onepager",
    },
    onePagerPath: {
      type: String,
      required: true,
    },
    proposalFilePath: {
      type: String,
      default: null,
    },
    originProject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
  },
  { timestamps: true }
);

const Proposal =
  mongoose.models.Proposal || mongoose.model("Proposal", proposalSchema);
export default Proposal;