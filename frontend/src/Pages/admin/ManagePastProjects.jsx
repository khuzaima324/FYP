import React, { useEffect, useState } from "react";
import { ApiCall } from "../../api/apiCall";
import { toast } from "react-toastify";

function ManagePastProjects() {
  const [projects, setProjects] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    session: "",
    supervisorName: "",
    studentNames: "", // Will be a comma-separated string in the form
    projectLink: "",
  });

  const token = JSON.parse(localStorage.getItem("userInfo"))?.token || null;

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await ApiCall({
          route: "past-projects",
          verb: "get",
          token: token,
        });
        setProjects(Array.isArray(res) ? res : []);
      } catch (err) {
        toast.error(err?.message || "Failed to fetch past projects");
      }
    };
    fetchProjects();
  }, [refresh, token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const clearForm = () => {
    setFormData({
      title: "",
      description: "",
      session: "",
      supervisorName: "",
      studentNames: "",
      projectLink: "",
    });
    setEditingProject(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Convert comma-separated string to array
    const studentNamesArray = formData.studentNames.split(',').map(name => name.trim()).filter(Boolean);
    const dataToSend = { ...formData, studentNames: studentNamesArray };

    try {
      if (editingProject) {
        await ApiCall({
          route: `past-projects/${editingProject._id}`,
          verb: "put",
          data: dataToSend,
          token: token,
        });
        toast.success("Project updated successfully");
      } else {
        await ApiCall({
          route: "past-projects",
          verb: "post",
          data: dataToSend,
          token: token,
        });
        toast.success("Project added successfully");
      }
      clearForm();
      setRefresh(!refresh);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error saving project");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await ApiCall({
        route: `past-projects/${id}`,
        verb: "delete",
        token: token,
      });
      toast.success("Project deleted successfully");
      setRefresh(!refresh);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error deleting project");
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      session: project.session,
      supervisorName: project.supervisorName,
      studentNames: (project.studentNames || []).join(", "), // Convert array back to string
      projectLink: project.projectLink || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        {editingProject ? "Edit Past Project" : "Manage Past Projects"}
      </h1>

      {/* Add/Edit Form */}
      <div className="mb-6 bg-white p-4 shadow rounded-lg">
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text" name="title" placeholder="Project Title"
            value={formData.title} onChange={handleChange} required
            className="w-full p-2 border rounded"
          />
          <textarea
            name="description" placeholder="Description"
            value={formData.description} onChange={handleChange} required
            className="w-full p-2 border rounded" rows="3"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text" name="session" placeholder="Session (e.g., 2021-2025)"
              value={formData.session} onChange={handleChange} required maxLength="9"
              className="w-full p-2 border rounded"
            />
            <input
              type="text" name="supervisorName" placeholder="Supervisor's Name"
              value={formData.supervisorName} onChange={handleChange} required
              className="w-full p-2 border rounded"
            />
          </div>
          <input
            type="text" name="studentNames" placeholder="Student Names (comma-separated)"
            value={formData.studentNames} onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <input
            type="text" name="projectLink" placeholder="Project Link (e.g., GitHub, optional)"
            value={formData.projectLink} onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <div className="flex gap-3">
            <button type="submit" className="bg-[#a96a3f] text-white px-4 py-2 rounded hover:opacity-90">
              {editingProject ? "Update Project" : "Add Project"}
            </button>
            {editingProject && (
              <button type="button" onClick={clearForm} className="bg-gray-400 text-white px-4 py-2 rounded hover:opacity-90">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Project List */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Project Archive</h2>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2 text-left">Title</th>
                <th className="border px-3 py-2 text-left">Session</th>
                <th className="border px-3 py-2 text-left">Supervisor</th>
                <th className="border px-3 py-2 text-left">Students</th>
                <th className="border px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr><td colSpan="5" className="text-center p-4">No past projects found.</td></tr>
              ) : (
                projects.map((project) => (
                  <tr key={project._id} className="border-t">
                    <td className="border px-3 py-2">{project.title}</td>
                    <td className="border px-3 py-2">{project.session}</td>
                    <td className="border px-3 py-2">{project.supervisorName}</td>
                    <td className="border px-3 py-2">{(project.studentNames || []).join(", ")}</td>
                    <td className="border px-3 py-2 flex gap-2">
                      <button onClick={() => handleEdit(project)} className="bg-blue-500 text-white px-2 py-1 rounded">Edit</button>
                      <button onClick={() => handleDelete(project._id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
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

export default ManagePastProjects;