import User from "../../models/userModel.js";
import Student from "../../models/studentModel.js";
import Project from "../../models/projectModel.js";

// @desc    Get the logged-in student's dashboard data
// @route   GET /api/student/dashboard
export const getStudentDashboardData = async (req, res) => {
  try {
    // 1. Find the logged-in student's profile
    const student = await Student.findOne({ userId: req.user._id }).populate(
      "supervisor",
      "name"
    );

    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    // 2. Find their assigned project
    const project = await Project.findOne({ students: student._id }).populate(
      "supervisor",
      "name"
    );

    // 3. ✅ NEW: Find their group members
    let groupMembers = [];
    if (student.group) {
      // Find all students in the same group, but exclude the logged-in user
      groupMembers = await Student.find({
        group: student.group,
        _id: { $ne: student._id }, // $ne means "not equal"
      }).select("name rollNumber"); // Only send the name and roll number
    }

    // 4. ✅ NEW: Return all data
    res.json({ student, project, groupMembers });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// @desc    Get the logged-in student's full profile
// @route   GET /api/student/profile
export const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id }).populate(
      "supervisor",
      "name email"
    );
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// @desc    Update the logged-in student's profile (name/email)
// @route   PUT /api/student/update-profile
export const updateStudentProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    // 1. Update the User document
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    user.name = name || user.name;
    user.email = email || user.email;
    await user.save();

    // 2. Update the linked Student document
    const student = await Student.findOne({ userId: req.user._id });
    if (student) {
      student.name = name || student.name;
      student.email = email || student.email;
      await student.save();
    }

    // 3. Return new info for localStorage
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      // token is not re-issued, frontend re-uses existing one
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error });
  }
};

// @desc    Change the logged-in student's password
// @route   PUT /api/student/change-password
export const changeStudentPassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Please provide all fields" });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (await user.matchPassword(currentPassword)) {
      user.password = newPassword; // 'pre-save' hook in userModel will hash this
      await user.save();
      res.json({ message: "Password changed successfully" });
    } else {
      res.status(401).json({ message: "Incorrect current password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error changing password", error });
  }
};