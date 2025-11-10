// routes/proposalRoutes.js
import express from "express";
import { 
  getPendingProposals, 
  approveProposal, 
  rejectProposal 
} from "../controllers/proposalController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/pending", protect, getPendingProposals);
router.put("/:id/approve", protect, approveProposal);
router.put("/:id/reject", protect, rejectProposal);

export default router;