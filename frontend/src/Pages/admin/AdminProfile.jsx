import { useState, useEffect } from "react";
import { ApiCall } from "../../api/apiCall";
import { toast } from "react-toastify"; // 1. Import toast

function AdminProfile() {
  const [admin, setAdmin] = useState({
    name: "",
    email: "",
    role: "",
    _id: "",
    createdAt: "",
  });
  const [loading, setLoading] = useState(true);

  // 2. New state for the separate password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [userInfo, setUserInfo] = useState(() => 
    JSON.parse(localStorage.getItem("userInfo")) || null
  );

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userInfo || !userInfo.token) {
        toast.error("You are not logged in!");
        setLoading(false);
        return;
      }

      try {
        const res = await ApiCall({
          route: "admin/profile",
          verb: "get",
          token: userInfo.token,
        });

        setAdmin({
          name: res.name || "",
          email: res.email || "",
          role: res.role || "",
          _id: res._id || "",
          createdAt: res.createdAt || "",
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
        toast.error(err?.response?.data?.message || "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userInfo?.token]); // Depend on the token

  // Handles changes for the main profile form
  const handleChange = (e) => {
    setAdmin({ ...admin, [e.target.name]: e.target.value });
  };
  
  // 3. New handler for the password form
  const handlePasswordFormChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  // 4. Updated function to ONLY update name/email
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await ApiCall({
        route: `admin/update-profile`,
        verb: "put",
        token: userInfo.token,
        data: {
          name: admin.name,
          email: admin.email,
          // We no longer send password here
        },
      });

      // 5. This is the FIX for the localStorage bug
      // We merge the new user data with our existing token
      const updatedUserInfo = { ...userInfo, ...res };
      localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
      setUserInfo(updatedUserInfo); // Update local state to match
      
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error updating profile");
    }
  };

  // 6. New function to handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      await ApiCall({
        route: `admin/change-password`, // You will need to create this new API route
        verb: "put",
        token: userInfo.token,
        data: {
          currentPassword,
          newPassword,
        },
      });

      toast.success("Password changed successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error changing password");
    }
  };


  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    // 7. Updated JSX with two forms
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-md shadow-lg divide-y divide-gray-200">
      
      {/* --- Section 1: Profile Details --- */}
      <div className="pb-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Admin Profile</h2>
        <div className="bg-gray-50 p-4 rounded-md text-sm space-y-1">
          <p><strong>ID:</strong> <span className="font-mono">{admin._id}</span></p>
          <p><strong>Role:</strong> <span className="font-medium capitalize">{admin.role}</span></p>
          <p>
            <strong>Joined:</strong>{" "}
            {admin.createdAt ? new Date(admin.createdAt).toLocaleString() : "—"}
          </p>
        </div>
      </div>

      {/* --- Section 2: Update Profile Form --- */}
      <div className="py-6">
        <h3 className="text-xl font-semibold mb-3">Update Information</h3>
        <form onSubmit={handleProfileUpdate} className="space-y-3">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={admin.name}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={admin.email}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            className="bg-[#a96a3f] text-white w-full py-2 rounded hover:opacity-90"
          >
            Update Profile
          </button>
        </form>
      </div>

      {/* --- Section 3: Change Password Form --- */}
      <div className="pt-6">
        <h3 className="text-xl font-semibold mb-3">Change Password</h3>
        <form onSubmit={handlePasswordChange} className="space-y-3">
          <input
            type="password"
            name="currentPassword"
            placeholder="Current Password"
            value={passwordData.currentPassword}
            onChange={handlePasswordFormChange}
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="password"
            name="newPassword"
            placeholder="New Password"
            value={passwordData.newPassword}
            onChange={handlePasswordFormChange}
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm New Password"
            value={passwordData.confirmPassword}
            onChange={handlePasswordFormChange}
            required
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            className="bg-gray-700 text-white w-full py-2 rounded hover:bg-gray-600"
          >
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminProfile;