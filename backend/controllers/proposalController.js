import Proposal from "../models/proposalModel.js";
import Project from "../models/projectModel.js";
import Student from "../models/studentModel.js";

// @desc    Get all pending proposals
// @route   GET /api/proposals/pending
export const getPendingProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find({ status: "pending" })
      .populate("students", "name")
      .populate("supervisor", "name");
    res.json(proposals);
  } catch (error) {
    res.status(500).json({ message: "Error fetching proposals", error });
  }
};

// @desc    Approve a proposal
// @route   PUT /api/proposals/:id/approve
export const approveProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }
    if (proposal.status !== "pending") {
      return res.status(400).json({ message: "Proposal already reviewed" });
    }

    // 1. Create a new Project from the proposal
    await Project.create({
      title: proposal.title,
      description: proposal.description,
      supervisor: proposal.supervisor,
      students: proposal.students,
      isAssigned: true, // It's assigned to these students
    });

    // 2. Update the proposal status
    proposal.status = "approved";
    await proposal.save();

    res.json({ message: "Proposal approved and project created" });
  } catch (error) {
    res.status(500).json({ message: "Error approving proposal", error });
  }
};

// @desc    Reject a proposal
// @route   PUT /api/proposals/:id/reject
export const rejectProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );
    
    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }

    res.json({ message: "Proposal rejected" });
  } catch (error) {
    res.status(500).json({ message: "Error rejecting proposal", error });
  }
};

// @desc    Get all proposals for the logged-in student
// @route   GET /api/proposals/my-proposals
export const getMyProposals = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const proposals = await Proposal.find({ students: student._id })
      .populate("supervisor", "name")
      .sort({ createdAt: -1 });
      
    res.json(proposals);
  } catch (error) {
    res.status(500).json({ message: "Error fetching proposals", error });
  }
};

// @desc    Create a new proposal
// @route   POST /api/proposals
export const createProposal = async (req, res) => {
  const { title, description, supervisor } = req.body;

  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }
    
    if (student.group) {
        return res.status(400).json({ message: "You are already in a group and cannot submit new proposals." });
    }

    const proposal = await Proposal.create({
      title,
      description,
      supervisor,
      students: [student._id], // Add the student who is proposing it
    });

    res.status(201).json(proposal);
  } catch (error) {
    res.status(500).json({ message: "Error submitting proposal", error });
  }
};