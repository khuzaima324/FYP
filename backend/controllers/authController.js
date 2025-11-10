import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js"; // You should have this utility

// This is a "factory function" - it creates a login function for a specific role.
export const loginUser = (role) => async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, role });

    if (user && (await user.matchPassword(password))) {
      // Check if account is active
      if (!user.isActive) {
        res.status(401);
        throw new Error("Your account has been deactivated by an admin.");
      }

      // Login is successful, send back data
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error("Invalid email or password");
    }
  } catch (error) {
    // Manually handle the "isActive" error message
    res.status(res.statusCode === 401 ? 401 : 500).json({
      message: error.message || "Server Error",
    });
  }
};