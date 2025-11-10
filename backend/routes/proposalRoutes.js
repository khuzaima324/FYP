// // routes/proposalRoutes.js
// import express from "express";
// import { 
//   getPendingProposals, 
//   approveProposal, 
//   rejectProposal 
// } from "../controllers/proposalController.js";
// import { protect } from "../middlewares/authMiddleware.js";

// const router = express.Router();

// router.get("/pending", protect, getPendingProposals);
// router.put("/:id/approve", protect, approveProposal);
// router.put("/:id/reject", protect, rejectProposal);

// export default router;

import express from "express";
import {
  getPendingProposals,
  approveProposal,
  rejectProposal,
  getMyProposals, // ✅ ADD
  createProposal, // ✅ ADD
} from "../controllers/proposalController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Admin routes
router.get("/pending", protect, getPendingProposals);
router.put("/:id/approve", protect, approveProposal);
router.put("/:id/reject", protect, rejectProposal);

// Student routes
router.get("/my-proposals", protect, getMyProposals); // ✅ ADD
router.post("/", protect, createProposal); // ✅ ADD

export default router;