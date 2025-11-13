import Proposal from "../models/proposalModel.js";
import Project from "../models/projectModel.js";
import Student from "../models/studentModel.js";

// @desc    Get all pending proposals
// @route   GET /api/proposals/pending
export const getPendingProposals = async (req, res) => {
  try {
    // ✅ 1. FIXED: Find *all* proposals that need admin action
    const proposals = await Proposal.find({ 
      status: { $in: ['pending_onepager', 'pending_final_approval'] } 
    })
      .populate("students", "name group")
      .populate("supervisor", "name");

    const formattedProposals = proposals.map(p => ({
      _id: p._id,
      title: p.title,
      description: p.description,
      status: p.status,
      students: p.students,
      supervisor: p.supervisor,
      originProject: p.originProject,
      onePagerPath: p.onePagerPath,
      proposalFilePath: p.proposalFilePath, // Send both file paths
    }));
      
    res.json(formattedProposals);
  } catch (error) {
    res.status(500).json({ message: "Error fetching proposals", error });
  }
};

// @desc    Reject a proposal (at any stage)
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
      .populate("originProject")
      .sort({ createdAt: -1 })
      .lean();
      
    res.json(proposals);
  } catch (error) {
    res.status(500).json({ message: "Error fetching proposals", error });
  }
};

// @desc    Create a new proposal (One-Pager Submission)
// @route   POST /api/proposals
export const createProposal = async (req, res) => {
  const { title, description, supervisor, originProject } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: "One-pager (PDF) is required" });
  }
  if (!title) {
    return res.status(400).json({ message: "A project title is required" });
  }

  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }
    const groupName = student.group;
    if (!groupName) {
      return res.status(400).json({ message: "You must be in a group to submit." });
    }
    
    const groupMembers = await Student.find({ group: groupName });
    const groupMemberIds = groupMembers.map(s => s._id);

    const existingProject = await Project.findOne({ students: { $in: groupMemberIds } });
    if (existingProject) {
      return res.status(400).json({ message: "Your group is already assigned to a project." });
    }
    
    // ✅ 2. FIXED: Check for *all* pending statuses
    const pendingProposal = await Proposal.findOne({ 
      students: { $in: groupMemberIds }, 
      status: { $in: ['pending_onepager', 'pending_proposal', 'pending_final_approval']} 
    });
    if (pendingProposal) {
      return res.status(400).json({ message: "Your group already has a pending proposal." });
    }

    const proposal = await Proposal.create({
      title,
      description: description || "N/A",
      supervisor: supervisor || null,
      students: groupMemberIds,
      onePagerPath: req.file.path,
      originProject: originProject || null,
      status: 'pending_onepager', // ✅ 3. FIXED: Set correct initial status
    });

    res.status(201).json(proposal);
  } catch (error) {
    console.error("Error creating proposal:", error);
    res.status(500).json({ message: "Error submitting proposal", error });
  }
};

// ===================================
// ✅ 4. NEW: FUNCTION TO APPROVE ONE-PAGER
// ===================================
// @desc    Approve a One-Pager
// @route   PUT /api/proposals/:id/approve-onepager
export const approveOnePager = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }
    if (proposal.status !== 'pending_onepager') {
        return res.status(400).json({ message: "Proposal is not awaiting one-pager approval." });
    }
    
    proposal.status = 'pending_proposal'; // Move to next step
    await proposal.save();
    
    res.json({ message: "One-Pager approved. Student can now submit full proposal." });
  } catch (error) {
    res.status(500).json({ message: "Error approving one-pager", error });
  }
};


// @desc    Approve a Full Proposal (Final Approval)
// @route   PUT /api/proposals/:id/approve-final
export const approveFinalProposal = async (req, res) => {
  const { supervisorId } = req.body; // Admin can assign a supervisor

  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }
    
    // ✅ 5. FIXED: Check for correct status
    if (proposal.status !== "pending_final_approval") {
      return res.status(400).json({ message: "Proposal is not awaiting final approval." });
    }
    
    const existingProject = await Project.findOne({ students: { $in: proposal.students } });
    if (existingProject) {
        proposal.status = "rejected";
        await proposal.save();
        return res.status(400).json({ message: "Group was assigned another project. This proposal is now rejected." });
    }
    
    // Determine the supervisor
    const finalSupervisorId = supervisorId || proposal.supervisor || null;

    if (proposal.originProject) {
      // This was an APPLICATION for an EXISTING project
      const project = await Project.findById(proposal.originProject);
      if (!project) {
        return res.status(404).json({ message: "The project this proposal was for no longer exists." });
      }
      if (project.isAssigned) {
        return res.status(400).json({ message: "Project was assigned to another group. Cannot approve." });
      }
      
      project.isAssigned = true;
      project.students = proposal.students;
      project.supervisor = finalSupervisorId; // Assign the supervisor
      await project.save();
      
    } else {
      // This was a NEW IDEA, create a new project
      await Project.create({
        title: proposal.title,
        description: proposal.description,
        supervisor: finalSupervisorId,
        students: proposal.students,
        isAssigned: true,
        origin: 'proposal',
      });
    }

    // Update the proposal status
    proposal.status = "approved";
    proposal.supervisor = finalSupervisorId; // Save the final supervisor
    await proposal.save();
    
    // Update students with the supervisor
    if (finalSupervisorId) {
      await Student.updateMany(
        { _id: { $in: proposal.students } },
        { supervisor: finalSupervisorId }
      );
    }

    res.json({ message: "Proposal approved and project assigned" });
  } catch (error) {
    console.error("Error approving proposal:", error)
    res.status(500).json({ message: "Error approving proposal", error });
  }
};

// ===================================
// ✅ 6. NEW: FUNCTION FOR STUDENT TO SUBMIT FULL PROPOSAL
// ===================================
// @desc    Student submits their FULL proposal
// @route   PUT /api/proposals/:id/submit-proposal
// controllers/proposalController.js

export const submitFullProposal = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Full proposal file is required" });
  }
  
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }

    // Security check: ensure the user is part of this proposal
    const student = await Student.findOne({ userId: req.user._id });

    // ===================================
    // ✅ THIS IS THE FIX
    // We must check if student exists before accessing ._id
    // ===================================
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }
    
    const isStudentInProposal = proposal.students.some(id => id.equals(student._id));
    if (!isStudentInProposal) {
      return res.status(403).json({ message: "You are not authorized for this proposal" });
    }
    
    // Check correct status
    if (proposal.status !== 'pending_proposal') {
        return res.status(400).json({ message: 'One-pager has not been approved yet.' });
    }
    
    // Update the proposal
    proposal.proposalFilePath = req.file.path;
    proposal.status = 'pending_final_approval'; // Move to the next step
    await proposal.save();

    res.json({ message: "Full proposal submitted successfully", proposal });
  } catch (error) {
    console.error("Error submitting full proposal:", error);
    res.status(500).json({ message: "Error submitting proposal", error: error.message });
  }
};