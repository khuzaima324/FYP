import React, { useEffect, useState } from "react";
import { ApiCall } from "../../api/apiCall";
import { toast } from "react-toastify"; // Import toast

function ManageTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [editingTeacher, setEditingTeacher] = useState(null); // For edit state
  const [refresh, setRefresh] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    password: "",
    empId: "", // Added empId
  });

  // Get admin token
  const adminInfo = JSON.parse(localStorage.getItem("userInfo"));
  const token = adminInfo?.token || null;

  // Fetch teachers
  const fetchTeachers = async () => {
    try {
      const res = await ApiCall({
        route: "teachers",
        verb: "get",
        token: token, // Added token
      });
      setTeachers(Array.isArray(res) ? res : res.teachers || []);
    } catch (err) {
      console.error("Error fetching teachers:", err.message || err);
      toast.error(err?.message || "Failed to fetch teachers");
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [refresh]);

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Clear form helper
  const clearForm = () => {
    setFormData({
      name: "",
      email: "",
      department: "",
      password: "",
      empId: "",
    });
    setEditingTeacher(null);
  };

  // Add or Update teacher
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.email || !formData.department || !formData.empId) {
      toast.error("Please fill in name, email, department, and Employee ID");
      return;
    }
    // Password is required only when *adding* a new teacher
    if (!editingTeacher && !formData.password) {
      toast.error("Password is required for new teachers");
      return;
    }

    try {
      if (editingTeacher) {
        // --- UPDATE LOGIC ---
        await ApiCall({
          route: `teachers/${editingTeacher._id}`,
          verb: "put",
          data: formData,
          token: token,
        });
        toast.success("Teacher updated successfully");
      } else {
        // --- ADD LOGIC ---
        await ApiCall({
          route: "teachers",
          verb: "post",
          data: formData,
          token: token,
        });
        toast.success("Teacher added successfully");
      }
      clearForm();
      setRefresh(!refresh);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error saving teacher");
    }
  };
  
  // ✅ NEW FUNCTION
  const handleToggleStatus = async (teacherId, currentStatus) => {
    const action = currentStatus ? "deactivate" : "activate";
    if (!window.confirm(`Are you sure you want to ${action} this teacher?`)) return;
    
    try {
      await ApiCall({
        route: `teachers/${teacherId}/status`,
        verb: "put",
        token: token,
      });
      toast.success(`Teacher has been ${action}d`);
      setRefresh(!refresh);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error updating status");
    }
  };

  // Delete teacher
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure? This will permanently delete the teacher.")) return;
    try {
      await ApiCall({
        route: `teachers/${id}`,
        verb: "delete",
        token: token, // Added token
      });
      toast.success("Teacher deleted successfully");
      setRefresh(!refresh);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error deleting teacher");
    }
  };

  // Handle Edit button click
  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      department: teacher.department,
      empId: teacher.empId || "",
      password: "", // Password field is cleared for security
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        {editingTeacher ? "Edit Teacher" : "Manage Teachers"}
      </h1>

      {/* Add/Edit Teacher Form */}
      <div className="mb-6">
        <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
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
          <input
            type="text"
            name="department"
            placeholder="Department"
            value={formData.department}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
           <input
            type="text"
            name="empId"
            placeholder="Employee ID"
            value={formData.empId}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="password"
            name="password"
            placeholder={
              editingTeacher
                ? "Password (leave blank to keep same)"
                : "Password"
            }
            value={formData.password}
            onChange={handleChange}
            required={!editingTeacher} // Only required when adding
            className="w-full p-2 border rounded"
          />
          
          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-[#a96a3f] text-white px-4 py-2 rounded hover:opacity-90"
            >
              {editingTeacher ? "Update Teacher" : "Add Teacher"}
            </button>
            {editingTeacher && (
              <button
                type="button"
                onClick={clearForm}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:opacity-90"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Teacher List */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Teacher List</h2>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2 text-left">Name</th>
                <th className="border px-3 py-2 text-left">Email</th>
                <th className="border px-3 py-2 text-left">Employee ID</th>
                <th className="border px-3 py-2 text-left">Department</th>
                <th className="border px-3 py-2 text-left">Status</th>
                <th className="border px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center p-4"> {/* ✅ ColSpan is 6 */}
                    No teachers found
                  </td>
                </tr>
              ) : (
                teachers.map((teacher) => (
                  <tr key={teacher._id} className="border-t">
                    <td className="border px-3 py-2">{teacher.name}</td>
                    <td className="border px-3 py-2">{teacher.email}</td>
                    <td className="border px-3 py-2">{teacher.empId}</td>
                    <td className="border px-3 py-2">{teacher.department}</td>
                    
                    {/* ✅ NEW STATUS CELL */}
                    <td className="border px-3 py-2">
                      {teacher.isActive ? (
                        <span className="text-green-600 font-semibold">Active</span>
                      ) : (
                        <span className="text-gray-500 font-semibold">Inactive</span>
                      )}
                    </td>

                    <td className="border px-3 py-2 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleEdit(teacher)}
                        className="bg-blue-500 text-white px-2 py-1 rounded hover:opacity-90"
                      >
                        Edit
                      </button>
                      
                      {/* ✅ NEW TOGGLE BUTTON */}
                      <button
                        onClick={() => handleToggleStatus(teacher._id, teacher.isActive)}
                        className={`px-2 py-1 rounded text-white ${
                          teacher.isActive
                            ? "bg-yellow-600 hover:opacity-90"
                            : "bg-green-600 hover:opacity-90"
                        }`}
                      >
                        {teacher.isActive ? "Deactivate" : "Activate"}
                      </button>

                      <button
                        onClick={() => handleDelete(teacher._id)}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:opacity-90"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ManageTeachers;