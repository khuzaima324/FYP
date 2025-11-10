import { useState, useEffect } from "react";
import { ApiCall } from "../../api/apiCall";
import { toast } from "react-toastify";

function StudentProfile() {
  const [profile, setProfile] = useState({}); // For all read-only data
  const [formData, setFormData] = useState({ name: "", email: "" }); // For the edit form
  const [loading, setLoading] = useState(true);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Get user info from local storage
  const [userInfo, setUserInfo] = useState(() => 
    JSON.parse(localStorage.getItem("userInfo")) || null
  );
  const token = userInfo?.token;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        toast.error("You are not logged in!");
        setLoading(false);
        return;
      }

      try {
        // You will need to create this new backend route
        const res = await ApiCall({
          route: "student/profile",
          verb: "get",
          token: token,
        });

        setProfile(res); // Set all profile data
        setFormData({ name: res.name, email: res.email }); // Set editable form data
      } catch (err) {
        console.error("Error fetching profile:", err);
        toast.error(err?.response?.data?.message || "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  // Handles changes for the main profile form
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  // Handles changes for the password form
  const handlePasswordFormChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  // Update Name/Email
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      // You will need to create this new backend route
      const res = await ApiCall({
        route: `student/update-profile`,
        verb: "put",
        token: token,
        data: formData,
      });

      // Update localStorage with new name/email
      const updatedUserInfo = { ...userInfo, ...res };
      localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
      setUserInfo(updatedUserInfo);
      
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error updating profile");
    }
  };

  // Change Password
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
      // You will need to create this new backend route
      await ApiCall({
        route: `student/change-password`,
        verb: "put",
        token: token,
        data: { currentPassword, newPassword },
      });

      toast.success("Password changed successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error changing password");
    }
  };


  if (loading) return <p className="text-center mt-10">Loading profile...</p>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-md shadow-lg divide-y divide-gray-200">
      
      {/* --- Section 1: Profile Details (Read-Only) --- */}
      <div className="pb-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Student Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 bg-gray-50 p-4 rounded-md">
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Roll No:</strong> {profile.rollNumber}</p>
          <p><strong>Department:</strong> {profile.department}</p>
          <p><strong>Session:</strong> {profile.session}</p>
          <p><strong>Semester:</strong> {profile.semester}</p>
          <p><strong>Section:</strong> {profile.section}</p>
          <p><strong>Group:</strong> {profile.group || "Not Assigned"}</p>
          <p><strong>Supervisor:</strong> {profile.supervisor?.name || "Not Assigned"}</p>
          <p>
            <strong>Joined:</strong>{" "}
            {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—"}
          </p>
        </div>
      </div>

      {/* --- Section 2: Update Profile Form --- */}
      <div className="py-6">
        <h3 className="text-xl font-semibold mb-3">Update Information</h3>
        <form onSubmit={handleProfileUpdate} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            type="submit"
            className="bg-[#a96a3f] text-white px-4 py-2 rounded hover:opacity-90"
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
            className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default StudentProfile;