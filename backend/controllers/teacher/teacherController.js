// controllers/teacherController.js
import Teacher from "../../models/teacherModel.js";
import User from "../../models/userModel.js"; // ✅ 1. Import User model

// Add new teacher (creates both Teacher + linked User)
export const addTeacher = async (req, res) => {
  try {
    const { name, email, password, department, empId } = req.body;

    // Validate input
    if (!name || !email || !password || !department || !empId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Create login account for teacher
    const user = await User.create({
      name,
      email,
      password,
      role: "teacher", // ✅ Set role
    });

    // Create teacher profile linked to user account
    const teacher = new Teacher({
      name,
      email,
      department,
      userId: user._id, // ✅ Link to the new User
      empId, // ✅ Set Employee ID
    });

    await teacher.save();

    res.status(201).json({
      message: "Teacher added successfully",
      teacher,
    });
  } catch (error) {
    console.error("Error adding teacher:", error);
    res.status(400).json({ message: error.message });
  }
};

// Get all teachers
export const getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().sort({ createdAt: -1 });
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get teacher by ID
export const getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });
    res.json(teacher);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update teacher and linked user
export const updateTeacher = async (req, res) => {
  try {
    const { name, email, department, password, empId } = req.body;

    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    // Update teacher profile info
    teacher.name = name || teacher.name;
    teacher.email = email || teacher.email;
    teacher.department = department || teacher.department;
    teacher.empId = empId || teacher.empId;
    await teacher.save();

    // Update linked user if exists
    if (teacher.userId) {
      const user = await User.findById(teacher.userId);
      if (user) {
        user.name = name || user.name;
        user.email = email || user.email;
        if (password) user.password = password; // auto-hashed in userModel
        await user.save();
      }
    }

    res.json({ message: "Teacher updated successfully", teacher });
  } catch (error) {
    console.error("Error updating teacher:", error);
    res.status(400).json({ message: error.message });
  }
};

// Delete teacher + linked user
export const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // --- UPDATED LOGIC ---
    if (teacher.userId) {
      // 1. New data: Delete user by their linked ID
      await User.findByIdAndDelete(teacher.userId);
    } else {
      // 2. Old data: Fallback to deleting user by their email
      // This cleans up orphaned user accounts
      await User.deleteOne({ email: teacher.email, role: "teacher" });
    }
    // --- END OF UPDATE ---

    // 3. Finally, delete the teacher profile
    await Teacher.findByIdAndDelete(req.params.id);

    res.json({ message: "Teacher deleted successfully" });
  } catch (error) {
    console.error("Error deleting teacher:", error);
    res.status(500).json({ message: error.message });
  }
};

// teache staus toggle
export const toggleTeacherStatus = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const user = await User.findById(teacher.userId);
    if (!user) {
      return res.status(404).json({ message: "Linked user not found" });
    }

    // Toggle the status
    const newStatus = !teacher.isActive;
    teacher.isActive = newStatus;
    user.isActive = newStatus;

    // Save both
    await teacher.save();
    await user.save();

    res.json({ 
      message: `Teacher has been ${newStatus ? "activated" : "deactivated"}`,
      teacher,
    });
  } catch (error) {
    console.error("Error toggling teacher status:", error);
    res.status(500).json({ message: "Error toggling status", error });
  }
};