import Student from "../../models/StudentModel.js";
import User from "../../models/userModel.js";

// Add new student (creates both Student + linked User)
export const addStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      rollNumber,
      department,
      semester,
      section,
      group,
      session,
    } = req.body;

    // Validate input
    if (
      !name ||
      !email ||
      !password ||
      !rollNumber ||
      !department ||
      !semester ||
      !section ||
      !session // ✅ ADDED
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ ADDED: Validate session format
    if (!/^\d{4}-\d{4}$/.test(session)) {
      return res
        .status(400)
        .json({ message: "Session format must be YYYY-YYYY" });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Create login account for student
    const user = await User.create({
      name,
      email,
      password,
      role: "student",
    });

    // Create student profile linked to user account
    const student = new Student({
      name,
      email,
      rollNumber,
      department,
      semester,
      section,
      // password, // ❌ REMOVED: This belongs in the User model only
      userId: user._id,
      group: group || null, // ✅ ADDED
      session: session, // ✅ ADDED
    });

    await student.save();

    res.status(201).json({
      message: "Student added successfully",
      student,
      login: { email, password },
    });
  } catch (error) {
    console.error("Error adding student:", error);
    res.status(400).json({ message: error.message });
  }
};

// Get all students
export const getStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .populate("supervisor", "name") // This is correct
      .sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single student by ID
export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update student and linked user
export const updateStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      section,
      department,
      semester,
      rollNumber,
      group,
      session, // ✅ ADDED
    } = req.body;

    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Update student info
    student.name = name || student.name;
    student.email = email || student.email;
    student.section = section || student.section;
    student.department = department || student.department;
    student.semester = semester || student.semester;
    student.rollNumber = rollNumber || student.rollNumber;
    student.group = group; // This correctly allows group to be set to ""
    student.session = session || student.session; // ✅ ADDED

    await student.save();

    // Update linked user if exists
    if (student.userId) {
      const user = await User.findById(student.userId);
      if (user) {
        user.name = name || user.name;
        user.email = email || user.email;
        // user.group = group || user.group; // ❌ REMOVED: Incorrect, user model doesn't store group
        if (password) user.password = password; // auto-hashed in userModel
        await user.save();
      }
    }

    res.json({ message: "Student updated successfully", student });
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(400).json({ message: error.message });
  }
};

// Delete student + linked user
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (student.userId) {
      await User.findByIdAndDelete(student.userId);
    }

    await Student.findByIdAndDelete(req.params.id);

    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({ message: error.message });
  }
};

// assign Supervisor to Student
export const assignSupervisor = async (req, res) => {
  try {
    const { supervisorId } = req.body;
    const { id } = req.params;

    if (!supervisorId) {
      return res.status(400).json({ message: "Supervisor ID is required" });
    }

    const student = await Student.findByIdAndUpdate(
      id,
      { supervisor: supervisorId },
      { new: true }
    ).populate("supervisor", "name");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    console.error("Error assigning supervisor:", error);
    res.status(500).json({ message: "Error assigning supervisor", error });
  }
};

// assign or update group name for a single student
export const assignGroup = async (req, res) => {
  try {
    const { groupName } = req.body;
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    student.group = groupName;
    await student.save();

    res.status(200).json({ message: "Group assigned successfully", student });
  } catch (error) {
    console.error("Error assigning group:", error);
    res
      .status(500)
      .json({ message: "Error assigning group", error: error.message });
  }
};