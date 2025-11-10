import Group from "../../models/groupModel.js";
import Student from "../../models/studentModel.js";
import Teacher from "../../models/teacherModel.js";

// ✅ Create Group
export const createGroup = async (req, res) => {
  try {
    const { groupName, students, supervisor } = req.body;

    if (!groupName || !students || students.length === 0) {
      return res.status(400).json({ message: "Group name and students are required" });
    }

    const supervisorExists = supervisor ? await Teacher.findById(supervisor) : null;
    if (supervisor && !supervisorExists) {
      return res.status(404).json({ message: "Supervisor not found" });
    }

    const group = await Group.create({
      groupName,
      students,
      supervisor: supervisorExists ? supervisorExists._id : null,
    });

    res.status(201).json(group);
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ message: "Error creating group" });
  }
};

// ✅ Get All Groups
export const getGroups = async (req, res) => {
  try {
    const groups = await Group.find()
      .populate("students", "name rollNo email")
      .populate("supervisor", "name email");
    res.status(200).json(groups);
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({ message: "Error fetching groups" });
  }
};
