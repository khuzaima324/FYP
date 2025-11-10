import { useEffect, useState } from "react";
import { ApiCall } from "../../api/apiCall";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

function StudentDashboard() {
  const [dashboardData, setDashboardData] = useState({});
  const [myProposals, setMyProposals] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshToggle, setRefreshToggle] = useState(false);

  // State for the "Propose Project" modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProposal, setNewProposal] = useState({
    title: "",
    description: "",
    supervisor: "", // Will hold the teacher's ID
  });

  const token = JSON.parse(localStorage.getItem("userInfo"))?.token || null;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all dashboard data
        const [dataRes, proposalsRes, teachersRes] = await Promise.all([
          ApiCall({ route: "student/dashboard-data", verb: "get", token: token }), // Gets student's group, project, etc.
          ApiCall({ route: "proposals/my-proposals", verb: "get", token: token }), // Gets proposals by this student
          ApiCall({ route: "teachers", verb: "get", token: token }),
        ]);

        setDashboardData(dataRes || {});
        setMyProposals(Array.isArray(proposalsRes) ? proposalsRes : []);
        setTeachers(Array.isArray(teachersRes) ? teachersRes : []);

      } catch (err) {
        toast.error("Failed to fetch dashboard data: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshToggle, token]);

  const handleModalChange = (e) => {
    setNewProposal({ ...newProposal, [e.target.name]: e.target.value });
  };

  // Submit a new proposal
  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    if (!newProposal.title || !newProposal.description || !newProposal.supervisor) {
      toast.error("Please fill all fields to submit a proposal.");
      return;
    }

    try {
      await ApiCall({
        route: "proposals", // POST to /api/proposals (new endpoint needed)
        verb: "post",
        token: token,
        data: newProposal,
      });
      toast.success("Proposal submitted successfully!");
      setIsModalOpen(false);
      setNewProposal({ title: "", description: "", supervisor: "" });
      setRefreshToggle(s => !s);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit proposal");
    }
  };
  
  const getStatusClass = (status) => {
    if (status === 'approved') return 'text-green-600 bg-green-100';
    if (status === 'rejected') return 'text-red-600 bg-red-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  if (loading) return <p className="text-center mt-10">Loading dashboard...</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Student Dashboard</h1>
        {/* Only show propose button if they don't have a project */}
        {!dashboardData.project && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700"
          >
            Propose New Project
          </button>
        )}
      </div>
      
      {/* --- Main Info Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* My Project / Status */}
        <div className="bg-white p-6 shadow rounded-lg">
          <h2 className="text-xl font-semibold mb-4">My Project</h2>
          {dashboardData.project ? (
             <div>
                <h3 className="text-lg font-bold text-[#a96a3f]">{dashboardData.project.title}</h3>
                <p className="text-gray-700 mt-2">{dashboardData.project.description}</p>
             </div>
          ) : (
            <div className="text-center p-4 bg-gray-50 rounded">
              <p className="text-gray-600">You are not assigned to a project yet.</p>
              <Link to="/projects" className="text-[#a96a3f] font-medium hover:underline">
                Browse available projects
              </Link>
            </div>
          )}
        </div>
        
        {/* My Group & Supervisor */}
        <div className="bg-white p-6 shadow rounded-lg">
          <h2 className="text-xl font-semibold mb-4">My Details</h2>
          <div className="space-y-3">
             <p><strong>Group:</strong> {dashboardData.student?.group || "Not Assigned"}</p>
             <p><strong>Supervisor:</strong> {dashboardData.student?.supervisor?.name || "Not Assigned"}</p>
             {/* Add more student details here */}
          </div>
        </div>
      </div>

      {/* --- My Proposals --- */}
      <div className="bg-white p-6 shadow rounded-lg">
        <h2 className="text-xl font-semibold mb-4">My Proposals</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-sm font-medium">Title</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Supervisor</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {myProposals.length === 0 ? (
                <tr><td colSpan="3" className="p-4 text-center text-gray-500">You have not submitted any proposals.</td></tr>
              ) : (
                myProposals.map(prop => (
                  <tr key={prop._id} className="border-b">
                    <td className="px-4 py-2">{prop.title}</td>
                    <td className="px-4 py-2">{prop.supervisor?.name || 'N/A'}</td>
                    <td className="px-4 py-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusClass(prop.status)}`}>
                        {prop.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* "Propose Project" Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Propose a New Project</h2>
            <form onSubmit={handleProposalSubmit}>
              <div className="space-y-4">
                <input
                  type="text" name="title" placeholder="Project Title"
                  value={newProposal.title} onChange={handleModalChange}
                  className="w-full p-2 border rounded" required
                />
                <textarea
                  name="description" placeholder="Project Description"
                  value={newProposal.description} onChange={handleModalChange}
                  className="w-full p-2 border rounded" rows="4" required
                />
                <select
                  name="supervisor" value={newProposal.supervisor} onChange={handleModalChange}
                  className="w-full p-2 border rounded" required
                >
                  <option value="">Select a Supervisor to Propose</option>
                  {teachers.map(teacher => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-400 text-white px-4 py-2 rounded">
                  Cancel
                </button>
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
                  Submit Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;