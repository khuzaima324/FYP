// import express from "express";
// import {
//   getPendingProposals,
//   approveProposal,
//   rejectProposal,
//   getMyProposals,
//   createProposal,
//   submitFullProposal, // ✅ 1. IMPORT THE NEW FUNCTION
// } from "../controllers/proposalController.js";
// import { protect } from "../middlewares/authMiddleware.js";
// import proposalUpload from "../middlewares/proposalUploadMiddleware.js";

// const router = express.Router();

// // === ADMIN ROUTES ===
// // Get all pending proposals (for dashboard)
// router.get("/pending", protect, getPendingProposals);
// // Admin gives FINAL approval (creates the project)
// router.put("/:id/approve", protect, approveProposal);
// // Admin rejects a proposal
// router.put("/:id/reject", protect, rejectProposal);


// // === STUDENT ROUTES ===
// // Get all proposals for the logged-in student
// router.get("/my-proposals", protect, getMyProposals);

// // Student submits a NEW proposal (Step 1: One-Pager)
// router.post("/", protect, proposalUpload, createProposal);

// // ✅ 2. ADD THIS NEW ROUTE
// // Student submits their FULL proposal (Step 3)
// router.put(
//   "/:id/submit-proposal",
//   protect,
//   proposalUpload, // Use the same uploader
//   submitFullProposal
// );

// export default router;
import express from "express";
import {
  getPendingProposals,
  approveOnePager, // ✅ ADDED
  approveFinalProposal, // ✅ RENAMED
  rejectProposal,
  getMyProposals,
  createProposal,
  submitFullProposal,
} from "../controllers/proposalController.js";
import { protect } from "../middlewares/authMiddleware.js";
import proposalUpload from "../middlewares/proposalUploadMiddleware.js";
import fullProposalUpload from "../middlewares/fullProposalUploadMiddleware.js"; // ✅ NEW uploader

const router = express.Router();

// === ADMIN ROUTES ===
router.get("/pending", protect, getPendingProposals);
router.put("/:id/reject", protect, rejectProposal);

// ✅ NEW route for Admin to approve Stage 1 (One-Pager)
router.put("/:id/approve-onepager", protect, approveOnePager);

// ✅ UPDATED route for Admin to approve Stage 2 (Full Proposal)
router.put("/:id/approve-final", protect, approveFinalProposal);


// === STUDENT ROUTES ===
router.get("/my-proposals", protect, getMyProposals);
router.post("/", protect, proposalUpload, createProposal);
router.put(
  "/:id/submit-proposal",
  protect,
  fullProposalUpload,
  submitFullProposal
);

export default router;