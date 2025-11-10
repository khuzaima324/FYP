import Project from "../models/projectModel.js";

// @desc    Create a new project (by admin)
// @route   POST /api/projects
export const createProject = async (req, res) => {
  try {
    const { title, description, supervisor } = req.body;
    if (!title || !description || !supervisor) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    const project = await Project.create({
      title,
      description,
      supervisor,
      isAssigned: false, // Admin-suggested projects are available by default
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
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Error fetching projects", error });
  }
};