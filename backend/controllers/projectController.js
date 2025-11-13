import Project from "../models/projectModel.js";
import Student from "../models/studentModel.js";
import Proposal from "../models/proposalModel.js"; // ✅ ADD THIS IMPORT

// @desc    Create a new project (by admin)
// @route   POST /api/projects
export const createProject = async (req, res) => {
  try {
    const { title, description, supervisor } = req.body; // Supervisor is now optional

    // 1. Remove supervisor from validation
    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const project = await Project.create({
      title,
      description,
      // 2. Only add supervisor if one was sent (otherwise it will be null)
      supervisor: supervisor || null,
      isAssigned: false,
      origin: 'admin', // Set origin to 'admin' for manually created projects
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: "Error creating project", error });
  }
};

// @desc    Get all projects
// @route   GET /api/projects
export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("supervisor", "name")
      .populate("students", "name group") 
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Error fetching projects", error });
  }
};

// @desc    Get all AVAILABLE projects
// @route   GET /api/projects/available
export const getAvailableProjects = async (req, res) => {
  try {
    const projects = await Project.find({ isAssigned: false })
      .populate("supervisor", "name")
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Error fetching available projects", error });
  }
};

export const revokeProjectAssignment = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    if (!project.isAssigned) {
      return res.status(400).json({ message: "Project is not assigned" });
    }

    const studentIds = project.students; // Get the list of students in the project

    // 1. Update the Project
    project.isAssigned = false;
    project.students = [];
    await project.save();

    // 2. Update all Students in that group
    if (studentIds && studentIds.length > 0) {
      await Student.updateMany(
        { _id: { $in: studentIds } },
        { supervisor: null } // Set their supervisor back to null
        // We leave their 'group' name as-is for the admin to manage
      );

      // 3. Find the associated proposal and set it to 'rejected'
      const proposal = await Proposal.findOne({
        students: { $in: studentIds },
        status: "approved",
      });
      
      if (proposal) {
        proposal.status = "rejected";
        await proposal.save();
      }
    }

    res.json({ message: "Project assignment has been revoked." });
  } catch (error) {
    console.error("Error revoking project:", error);
    res.status(500).json({ message: "Error revoking project", error });
  }
};


// @desc    Student submits final documentation
// @route   PUT /api/projects/submit-documentation
// controllers/projectController.js

// ... (your other functions: createProject, getAllProjects, etc.)

// @desc    Student submits final documentation
// @route   PUT /api/projects/submit-documentation
export const submitFinalDocumentation = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Documentation file is required" });
  }

  const { projectLink } = req.body;

  try {
    // 1. Find the student's profile from their login token
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    // 2. Find their *assigned* project
    const project = await Project.findOne({ students: student._id, isAssigned: true });
    if (!project) {
      return res.status(404).json({ message: "No assigned project found" });
    }
    
    // 3. Update the project with the new file paths
    project.projectLink = projectLink || null;
    project.documentationPath = req.file.path; // req.file comes from middleware
    
    await project.save();
    
    res.json({ message: "Deliverables submitted successfully!", project });

  } catch (error) {
    console.error("Error submitting documentation:", error);
    res.status(500).json({ message: "Error submitting documentation", error: error.message });
  }
};