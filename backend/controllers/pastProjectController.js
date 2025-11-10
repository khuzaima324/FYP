import PastProject from "../models/pastProjectModel.js";

// @desc    Create a new past project (Admin)
// @route   POST /api/past-projects
export const createPastProject = async (req, res) => {
  try {
    const { title, description, session, supervisorName, studentNames, projectLink } = req.body;
    
    if (!title || !description || !session || !supervisorName) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }
    
    const pastProject = await PastProject.create({
      title,
      description,
      session,
      supervisorName,
      studentNames: studentNames || [],
      projectLink,
    });
    
    res.status(201).json(pastProject);
  } catch (error) {
    res.status(500).json({ message: "Error creating past project", error });
  }
};

// @desc    Get all past projects (All Roles)
// @route   GET /api/past-projects
export const getAllPastProjects = async (req, res) => {
  try {
    const projects = await PastProject.find().sort({ session: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Error fetching past projects", error });
  }
};

// @desc    Update a past project (Admin)
// @route   PUT /api/past-projects/:id
export const updatePastProject = async (req, res) => {
  try {
    const project = await PastProject.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    
    if (!project) {
      return res.status(404).json({ message: "Past project not found" });
    }
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Error updating past project", error });
  }
};

// @desc    Delete a past project (Admin)
// @route   DELETE /api/past-projects/:id
export const deletePastProject = async (req, res) => {
  try {
    const project = await PastProject.findByIdAndDelete(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: "Past project not found" });
    }
    
    res.json({ message: "Past project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting past project", error });
  }
};