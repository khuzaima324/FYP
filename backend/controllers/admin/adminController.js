import User from "../../models/userModel.js";
// ✅ 1. ADDED IMPORTS FOR STATS
import Student from "../../models/studentModel.js";
import Teacher from "../../models/teacherModel.js";
import Project from "../../models/projectModel.js";
import Proposal from "../../models/proposalModel.js";

// Get admin profile
export const getAdminProfile = async (req, res) => {
  try {
    // req.user._id comes from your 'protect' middleware
    const admin = await User.findById(req.user._id).select("-password");
    
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    if (admin.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Not an admin." });
    }

    res.status(200).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      createdAt: admin.createdAt, // Added this field for your UI
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// =======================================================
// ✅ 2. THIS FUNCTION IS UPDATED (FOR NAME/EMAIL ONLY)
// =======================================================
// Update admin profile (Name and Email ONLY)
export const updateAdminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user._id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Check if email is being changed and if it's already taken
    if (req.body.email && req.body.email !== admin.email) {
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    admin.name = req.body.name || admin.name;
    admin.email = req.body.email || admin.email;
    // We no longer update the password here

    const updatedAdmin = await admin.save();

    // Send back the updated user info (this updates localStorage on frontend)
    res.status(200).json({
      _id: updatedAdmin._id,
      name: updatedAdmin.name,
      email: updatedAdmin.email,
      role: updatedAdmin.role,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile", error: err.message });
  }
};

// =======================================================
// ✅ 3. NEW FUNCTION FOR PASSWORD (TO MATCH FRONTEND)
// =======================================================
// Change admin password
export const changeAdminPassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Please provide current and new passwords" });
  }

  try {
      const admin = await User.findById(req.user._id);
      if (!admin) {
          return res.status(404).json({ message: "Admin not found" });
      }

      // Check if current password matches
      // This assumes your userModel.js has the "matchPassword" method
      const isMatch = await admin.matchPassword(currentPassword);
      if (!isMatch) {
          return res.status(401).json({ message: "Incorrect current password" });
      }

      // Set new password (it will be hashed by your 'pre-save' hook in userModel)
      admin.password = newPassword;
      await admin.save();

      res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
  }
};

// =======================================================
// ✅ 4. NEW FUNCTION FOR DASHBOARD STATS
// =======================================================
// Get dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const studentCount = await Student.countDocuments();
    const teacherCount = await Teacher.countDocuments();
    const projectsAssignedCount = await Project.countDocuments({ isAssigned: true });
    const pendingProposalsCount = await Proposal.countDocuments({ status: "pending" });

    res.json({
      students: studentCount,
      teachers: teacherCount,
      projectsAssigned: projectsAssignedCount,
      pendingProposals: pendingProposalsCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats", error });
  }
};