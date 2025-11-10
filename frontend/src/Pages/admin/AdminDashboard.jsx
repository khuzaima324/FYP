import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiCall } from "../../api/apiCall";
import { toast } from "react-toastify";

// A simple component for the stat cards
function StatCard({ title, value }) {
  return (
    <div className="bg-white shadow rounded-lg p-4 text-center">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [proposals, setProposals] = useState([]);
  const [projects, setProjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshToggle, setRefreshToggle] = useState(false);
  
  // State for the "Suggest Project" modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    supervisor: "", // Will hold the teacher's ID
  });

  const token = JSON.parse(localStorage.getItem("userInfo"))?.token || null;

  useEffect(() => {
    const user = localStorage.getItem("userInfo");
    if (!user) {
      navigate("/login");
      return; // Stop execution if not logged in
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all dashboard data in parallel
        const [statsRes, proposalsRes, projectsRes, teachersRes] = await Promise.all([
          ApiCall({ route: "admin/stats", verb: "get", token: token }),
          ApiCall({ route: "proposals/pending", verb: "get", token: token }),
          ApiCall({ route: "projects", verb: "get", token: token }),
          ApiCall({ route: "teachers", verb: "get", token: token }),
        ]);

        setStats(statsRes || {});
        setProposals(Array.isArray(proposalsRes) ? proposalsRes : []);
        setProjects(Array.isArray(projectsRes) ? projectsRes : []);
        setTeachers(Array.isArray(teachersRes) ? teachersRes : []);

      } catch (err) {
        toast.error("Failed to fetch dashboard data: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, refreshToggle, token]);

  // --- Action Handlers ---

  const handleProposal = async (proposalId, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this proposal?`)) return;

    try {
      await ApiCall({
        route: `proposals/${proposalId}/${action}`, // e.g., /api/proposals/123/approve
        verb: "put",
        token: token,
      });
      toast.success(`Proposal ${action}ed successfully!`);
      setRefreshToggle(s => !s); // Refresh data
    } catch (err) {
      toast.error(err?.response?.data?.message || `Failed to ${action} proposal`);
    }
  };

  const handleModalChange = (e) => {
    setNewProject({ ...newProject, [e.target.name]: e.target.value });
  };

  const handleSuggestProject = async (e) => {
    e.preventDefault();
    if (!newProject.title || !newProject.description || !newProject.supervisor) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      await ApiCall({
        route: "projects", // POST to /api/projects
        verb: "post",
        token: token,
        data: newProject,
      });
      toast.success("Project suggested successfully!");
      setIsModalOpen(false);
      setNewProject({ title: "", description: "", supervisor: "" });
      setRefreshToggle(s => !s); // Refresh project list
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to suggest project");
    }
  };


  if (loading) return <p className="text-center mt-10">Loading dashboard...</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700"
        >
          Suggest New Project
        </button>
      </div>
      <p className="mb-6">
        Welcome! Here you can manage students, teachers, and system settings.
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Students" value={stats.students || 0} />
        <StatCard title="Total Teachers" value={stats.teachers || 0} />
        <StatCard title="Projects Assigned" value={stats.projectsAssigned || 0} />
        <StatCard title="Pending Proposals" value={stats.pendingProposals || 0} />
      </div>

      {/* Main Content Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pending Proposals */}
        <div className="bg-white p-4 shadow rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Pending Student Proposals</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium">Title</th>
                  <th className="px-4 py-2 text-left text-sm font-medium">Student(s)</th>
                  <th className="px-4 py-2 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {proposals.length === 0 ? (
                  <tr><td colSpan="3" className="p-4 text-center text-gray-500">No pending proposals.</td></tr>
                ) : (
                  proposals.map(prop => (
                    <tr key={prop._id} className="border-b">
                      <td className="px-4 py-2">{prop.title}</td>
                      <td className="px-4 py-2">{prop.students.map(s => s.name).join(', ')}</td>
                      <td className="px-4 py-2 flex gap-2">
                        <button onClick={() => handleProposal(prop._id, 'approve')} className="text-xs bg-green-500 text-white px-2 py-1 rounded">Approve</button>
                        <button onClick={() => handleProposal(prop._id, 'reject')} className="text-xs bg-red-500 text-white px-2 py-1 rounded">Reject</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* All Projects */}
        <div className="bg-white p-4 shadow rounded-lg">
          <h2 className="text-xl font-semibold mb-4">All Projects</h2>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium">Title</th>
                  <th className="px-4 py-2 text-left text-sm font-medium">Supervisor</th>
                  <th className="px-4 py-2 text-left text-sm font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {projects.length === 0 ? (
                  <tr><td colSpan="3" className="p-4 text-center text-gray-500">No projects found.</td></tr>
                ) : (
                  projects.map(proj => (
                    <tr key={proj._id} className="border-b">
                      <td className="px-4 py-2">{proj.title}</td>
                      <td className="px-4 py-2">{proj.supervisor?.name || 'N/A'}</td>
                      <td className="px-4 py-2">
                        {proj.isAssigned ? (
                          <span className="text-xs font-medium bg-red-100 text-red-800 px-2 py-0.5 rounded-full">Assigned</span>
                        ) : (
                          <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Available</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* "Suggest Project" Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Suggest a New Project</h2>
            <form onSubmit={handleSuggestProject}>
              <div className="space-y-4">
                <input
                  type="text"
                  name="title"
                  placeholder="Project Title"
                  value={newProject.title}
                  onChange={handleModalChange}
                  className="w-full p-2 border rounded"
                  required
                />
                <textarea
                  name="description"
                  placeholder="Project Description"
                  value={newProject.description}
                  onChange={handleModalChange}
                  className="w-full p-2 border rounded"
                  rows="4"
                  required
                />
                <select
                  name="supervisor"
                  value={newProject.supervisor}
                  onChange={handleModalChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select a Supervisor</option>
                  {teachers.map(teacher => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Submit Suggestion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
  
export default AdminDashboard;