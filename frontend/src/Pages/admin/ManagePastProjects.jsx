import React, { useEffect, useState, useMemo } from "react";
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
    department: "",
    groupName: "",
    studentNames: "",
    studentRollNumbers: "",
    projectLink: "",
  });

  const [search, setSearch] = useState("");
  const [filterSession, setFilterSession] = useState("");
  const [filterSupervisor, setFilterSupervisor] = useState("");
  const [filterDept, setFilterDept] = useState("");

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
    const { name, value } = e.target;
    
    if (name === "session") {
      let cleanValue = value.replace(/\D/g, "");
      if (cleanValue.length > 4) {
        cleanValue = `${cleanValue.slice(0, 4)}-${cleanValue.slice(4, 8)}`;
      }
      setFormData({ ...formData, [name]: cleanValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const clearForm = () => {
    setFormData({
      title: "",
      description: "",
      session: "",
      supervisorName: "",
      department: "",
      groupName: "",
      studentNames: "",
      studentRollNumbers: "",
      projectLink: "",
    });
    setEditingProject(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const studentNamesArray = formData.studentNames.split(',').map(name => name.trim()).filter(Boolean);
    const studentRollNumbersArray = formData.studentRollNumbers.split(',').map(roll => roll.trim()).filter(Boolean);

    if (studentNamesArray.length !== studentRollNumbersArray.length) {
      toast.error("The number of student names must match the number of roll numbers.");
      return;
    }

    const dataToSend = { 
      ...formData, 
      studentNames: studentNamesArray,
      studentRollNumbers: studentRollNumbersArray,
    };

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
      department: project.department || "",
      groupName: project.groupName || "",
      studentNames: (project.studentNames || []).join(", "),
      studentRollNumbers: (project.studentRollNumbers || []).join(", "),
      projectLink: project.projectLink || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- Logic for Filters & Search ---

  // Create memoized lists for filter dropdowns
  const { uniqueSessions, uniqueSupervisors } = useMemo(() => {
    const sessions = new Set();
    const supervisors = new Set();
    
    projects.forEach(p => {
      sessions.add(p.session);
      if (p.supervisorName && p.supervisorName.trim() !== "") {
        supervisors.add(p.supervisorName);
      }
    });

    return {
      uniqueSessions: [...sessions].sort().reverse(), // Show newest first
      uniqueSupervisors: [...supervisors].sort(),
    };
  }, [projects]);

  // Create memoized list of filtered projects
  const filteredProjects = useMemo(() => {
    const lowerSearch = search.toLowerCase().trim();

    // 1. Start with the full project list
    let filtered = projects.filter(p => {
      // 2. Apply all filters
      if (filterSession && p.session !== filterSession) return false;
      if (filterDept && p.department !== filterDept) return false;
      if (filterSupervisor && p.supervisorName !== filterSupervisor) return false;
      
      // 3. Apply search term
      if (!lowerSearch) return true; // Pass if no search term

      const studentNames = (p.studentNames || []).join(", ").toLowerCase();
      const rollNumbers = (p.studentRollNumbers || []).join(", ").toLowerCase();

      return (
        p.title.toLowerCase().includes(lowerSearch) ||
        (p.groupName || "").toLowerCase().includes(lowerSearch) ||
        (p.supervisorName || "").toLowerCase().includes(lowerSearch) ||
        studentNames.includes(lowerSearch) ||
        rollNumbers.includes(lowerSearch)
      );
    });
    
    // ===================================
    // ✅ 4. NEW SORTING LOGIC
    // ===================================
    // If a session is selected, sort the results by group name
    if (filterSession) {
      filtered.sort((a, b) => {
        const groupA = a.groupName || "";
        const groupB = b.groupName || "";

        if (groupA && !groupB) return -1; // Grouped items first
        if (!groupA && groupB) return 1;  // Un-grouped items last
        if (!groupA && !groupB) return 0; // Both un-grouped

        // Both have groups, sort them naturally (so G-2 comes before G-10)
        return groupA.localeCompare(groupB, undefined, { numeric: true, sensitivity: 'base' });
      });
    }
    
    return filtered; // Return the filtered AND sorted array

  }, [projects, search, filterSession, filterSupervisor, filterDept]);


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
            name="description" placeholder="Description (Optional)"
            value={formData.description} onChange={handleChange}
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
              value={formData.supervisorName} onChange={handleChange} 
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            >
              <option value="">Select Department</option>
              <option value="BS-IT">BS-IT</option>
              <option value="BS-CS">BS-CS</option>
            </select>
            <input
              type="text" name="groupName" placeholder="Group Name (e.g., G-1) (Optional)"
              value={formData.groupName} onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text" name="studentNames" placeholder="Student Names (comma-separated)"
              value={formData.studentNames} onChange={handleChange}
              className="w-full p-2 border rounded"
            />
            <input
              type="text" name="studentRollNumbers" placeholder="Roll Numbers (comma-separated)"
              value={formData.studentRollNumbers} onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
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

      {/* Search & Filter Bar */}
      <div className="mb-4 bg-white p-4 shadow rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Project Archive</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Search by title, group, student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2 border rounded col-span-1 md:col-span-2"
          />
          <select
            value={filterSession}
            onChange={(e) => setFilterSession(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">All Sessions</option>
            {uniqueSessions.map(session => (
              <option key={session} value={session}>{session}</option>
            ))}
          </select>
          <select
            value={filterSupervisor}
            onChange={(e) => setFilterSupervisor(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">All Supervisors</option>
            {uniqueSupervisors.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">All Departments</option>
            <option value="BS-IT">BS-IT</option>
            <option value="BS-CS">BS-CS</option>
          </select>
        </div>
      </div>

      {/* Project List */}
      <div>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2 text-left">Title</th>
                <th className="border px-3 py-2 text-left">Session</th>
                <th className="border px-3 py-2 text-left">Department</th>
                <th className="border px-3 py-2 text-left">Group</th>
                <th className="border px-3 py-2 text-left">Supervisor</th>
                <th className="border px-3 py-2 text-left">Students</th>
                <th className="border px-3 py-2 text-left">Roll Numbers</th>
                <th className="border px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center p-4">
                    {projects.length === 0 ? "No past projects found." : "No projects match your filters."}
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr key={project._id} className="border-t">
                    <td className="border px-3 py-2">{project.title}</td>
                    <td className="border px-3 py-2">{project.session}</td>
                    <td className="border px-3 py-2">{project.department}</td>
                    <td className="border px-3 py-2">{project.groupName || 'N/A'}</td>
                    <td className="border px-3 py-2">{project.supervisorName || 'N/A'}</td>
                    <td className="border px-3 py-2">{(project.studentNames || []).join(", ")}</td>
                    <td className="border px-3 py-2">{(project.studentRollNumbers || []).join(", ")}</td>
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