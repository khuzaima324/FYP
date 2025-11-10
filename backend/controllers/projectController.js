import Project from "../models/projectModel.js";
import Student from "../models/studentModel.js";

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

// @desc    Student selects a project
// @route   PUT /api/projects/:id/select
export const selectProject = async (req, res) => {
  try {
    const studentId = req.user._id; // This is the User ID
    const projectId = req.params.id;

    // 1. Find the student
    const student = await Student.findOne({ userId: studentId });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    // 2. Check if student is already in a group/project
    if (student.group) {
      return res.status(400).json({ message: "You are already in a group or have a project" });
    }

    // 3. Find the project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    // 4. Check if project is available
    if (project.isAssigned) {
      return res.status(400).json({ message: "Sorry, this project is no longer available" });
    }

    // 5. Assign the project
    project.isAssigned = true;
    project.students.push(student._id);
    
    // 6. Assign the project details to the student
    student.group = `Project_${project.title.split(' ')[0].replace(/\W/g, '')}`; // Auto-create a group name
    student.supervisor = project.supervisor; // Assign project supervisor to student
    
    await project.save();
    await student.save();
    
    res.json({ message: "Project selected successfully" });

  } catch (error) {
    console.error("Error selecting project:", error);
    res.status(500).json({ message: "Error selecting project", error });
  }
};