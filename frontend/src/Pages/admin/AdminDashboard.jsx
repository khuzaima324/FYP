// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { ApiCall } from "../../api/apiCall";
// import { toast } from "react-toastify";

// // ✅ 1. Added API_URL for file links
// const API_URL = "http://localhost:5000";

// // A simple component for the stat cards
// function StatCard({ title, value }) {
//   return (
//     <div className="bg-white shadow rounded-lg p-4 text-center">
//       <h3 className="text-sm font-medium text-gray-500">{title}</h3>
//       <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
//     </div>
//   );
// }

// function AdminDashboard() {
//   const navigate = useNavigate();
//   const [stats, setStats] = useState({});
//   const [proposals, setProposals] = useState([]);
//   const [projects, setProjects] = useState([]);
//   const [teachers, setTeachers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshToggle, setRefreshToggle] = useState(false);
  
//   // State for the "Suggest Project" modal
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [newProject, setNewProject] = useState({
//     title: "",
//     description: "",
//     supervisor: "", // Will hold the teacher's ID
//   });

//   // ✅ 2. Renamed state for the new "Details" modal
//   const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
//   const [selectedProposal, setSelectedProposal] = useState(null);
//   const [selectedSupervisorId, setSelectedSupervisorId] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const token = JSON.parse(localStorage.getItem("userInfo"))?.token || null;

//   useEffect(() => {
//     const user = localStorage.getItem("userInfo");
//     if (!user) {
//       navigate("/login");
//       return; // Stop execution if not logged in
//     }

//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         // Fetch all dashboard data in parallel
//         const [statsRes, proposalsRes, projectsRes, teachersRes] = await Promise.all([
//           ApiCall({ route: "admin/stats", verb: "get", token: token }),
//           ApiCall({ route: "proposals/pending", verb: "get", token: token }),
//           ApiCall({ route: "projects", verb: "get", token: token }),
//           ApiCall({ route: "teachers", verb: "get", token: token }),
//         ]);

//         setStats(statsRes || {});
//         setProposals(Array.isArray(proposalsRes) ? proposalsRes : []);
//         setProjects(Array.isArray(projectsRes) ? projectsRes : []);
//         setTeachers(Array.isArray(teachersRes) ? teachersRes : []);

//       } catch (err) {
//         toast.error("Failed to fetch dashboard data: " + err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [navigate, refreshToggle, token]);

//   // --- Action Handlers ---

//   // ✅ 3. Updated function: now just opens the details modal
//   const openDetailsModal = (proposal) => {
//     setSelectedProposal(proposal);
//     // Pre-fill supervisor if one was already suggested (e.g., from an application)
//     setSelectedSupervisorId(proposal.supervisor?._id || "");
//     setIsDetailsModalOpen(true);
//   };

//   const closeDetailsModal = () => {
//     setIsDetailsModalOpen(false);
//     setSelectedProposal(null);
//     setSelectedSupervisorId("");
//   };
  
//   // project revoke function (Unchanged)
//   const handleRevoke = async (projectId, projectTitle) => {
//     if (!window.confirm(`Are you sure you want to REVOKE this project?\n\n"${projectTitle}"\n\nThis will remove the group and supervisor.`)) return;

//     try {
//       await ApiCall({
//         route: `projects/${projectId}/revoke`,
//         verb: "put",
//         token: token,
//       });
//       toast.success("Project assignment revoked!");
//       setRefreshToggle(s => !s); // Refresh all data
//     } catch (err) {
//       toast.error(err?.response?.data?.message || `Failed to revoke project`);
//     }
//   };

//   // ✅ 4. Renamed function (was handleApprovalSubmit)
//   const handleApproveProject = async (e) => {
//     e.preventDefault();
//     if (!selectedProposal) return;

//     setIsSubmitting(true);
//     try {
//       await ApiCall({
//         route: `proposals/${selectedProposal._id}/approve`,
//         verb: "put",
//         token: token,
//         data: { supervisorId: selectedSupervisorId || null }, // Send ID or null
//       });
      
//       toast.success("Proposal approved!");
//       closeDetailsModal();
//       setRefreshToggle(s => !s);
//     } catch (err) {
//       toast.error(err?.response?.data?.message || "Failed to approve proposal");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // ✅ 5. New function for the modal's reject button
//   const handleRejectProject = async () => {
//     if (!selectedProposal) return;
//     if (!window.confirm(`Are you sure you want to REJECT this proposal?\n\n"${selectedProposal.title}"`)) return;

//     setIsSubmitting(true);
//     try {
//       await ApiCall({
//         route: `proposals/${selectedProposal._id}/reject`,
//         verb: "put",
//         token: token,
//       });
//       toast.success(`Proposal rejected successfully!`);
//       closeDetailsModal();
//       setRefreshToggle(s => !s);
//     } catch (err) {
//       toast.error(err?.response?.data?.message || `Failed to reject proposal`);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleModalChange = (e) => {
//     setNewProject({ ...newProject, [e.target.name]: e.target.value });
//   };

//   const handleSuggestProject = async (e) => {
//     e.preventDefault();
    
//     if (!newProject.title || !newProject.description) {
//       toast.error("Please fill in title and description");
//       return;
//     }

//     try {
//       await ApiCall({
//         route: "projects", // POST to /api/projects
//         verb: "post",
//         token: token,
//         data: newProject, // Sends { title, desc, supervisor: "" or "id" }
//       });
//       toast.success("Project suggested successfully!");
//       setIsModalOpen(false);
//       setNewProject({ title: "", description: "", supervisor: "" });
//       setRefreshToggle(s => !s); // Refresh project list
//     } catch (err) {
//       toast.error(err?.response?.data?.message || "Failed to suggest project");
//     }
//   };


//   if (loading) return <p className="text-center mt-10">Loading dashboard...</p>;

//   return (
//     <div className="p-6">
//       <div className="flex justify-between items-center mb-4">
//         <h1 className="text-2xl font-bold">Admin Dashboard</h1>
//         <button
//           onClick={() => setIsModalOpen(true)}
//           className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700"
//         >
//           Suggest New Project
//         </button>
//       </div>
//       <p className="mb-6">
//         Welcome! Here you can manage students, teachers, and system settings.
//       </p>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//         <StatCard title="Total Students" value={stats.students || 0} />
//         <StatCard title="Total Teachers" value={stats.teachers || 0} />
//         <StatCard title="Projects Assigned" value={stats.projectsAssigned || 0} />
//         <StatCard title="Pending Proposals" value={stats.pendingProposals || 0} />
//       </div>

//       {/* Main Content Grids */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
//         {/* =================================== */}
//         {/* ✅ 6. UPDATED PENDING PROPOSALS TABLE */}
//         {/* =================================== */}
//         <div className="bg-white p-4 shadow rounded-lg">
//           <h2 className="text-xl font-semibold mb-4">Pending Student Proposals</h2>
//           <div className="overflow-x-auto max-h-96">
//             <table className="w-full">
//               <thead>
//                 <tr className="bg-gray-50">
//                   <th className="px-4 py-2 text-left text-sm font-medium">Title</th>
//                   <th className="px-4 py-2 text-left text-sm font-medium">Group</th>
//                   <th className="px-4 py-2 text-left text-sm font-medium">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {proposals.length === 0 ? (
//                   <tr><td colSpan="3" className="p-4 text-center text-gray-500">No pending proposals.</td></tr>
//                 ) : (
//                   proposals.map(prop => (
//                     <tr key={prop._id} className="border-b">
//                       <td className="px-4 py-2">{prop.title}</td>
//                       <td className="px-4 py-2">{prop.students[0]?.group || 'N/A'}</td>
//                       <td className="px-4 py-2 flex gap-2">
//                         <button 
//                           onClick={() => openDetailsModal(prop)} 
//                           className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
//                         >
//                           View Details
//                         </button>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* =================================== */}
//         {/* ✅ 7. UPDATED "ALL PROJECTS" TABLE */}
//         {/* =================================== */}
//         <div className="bg-white p-4 shadow rounded-lg">
//           <h2 className="text-xl font-semibold mb-4">All Projects</h2>
//           <div className="overflow-x-auto max-h-96">
//             <table className="w-full">
//               <thead>
//                 <tr className="bg-gray-50">
//                   <th className="px-4 py-2 text-left text-sm font-medium">Title</th>
//                   <th className="px-4 py-2 text-left text-sm font-medium">Supervisor</th>
//                   <th className="px-4 py-2 text-left text-sm font-medium">Group</th>
//                   <th className="px-4 py-2 text-left text-sm font-medium">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {projects.length === 0 ? (
//                   <tr><td colSpan="4" className="p-4 text-center text-gray-500">No projects found.</td></tr>
//                 ) : (
//                   projects.map(proj => (
//                     <tr key={proj._id} className="border-b">
//                       <td className="px-4 py-2">{proj.title}</td>
//                       <td className="px-4 py-2">{proj.supervisor?.name || 'N/A'}</td>
//                       <td className="px-4 py-2">{proj.students[0]?.group || 'N/A'}</td>
//                       <td className="px-4 py-2">
//                         {proj.isAssigned ? (
//                           <div className="flex items-center gap-2">
//                             <span className="text-xs font-medium bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
//                               Assigned
//                             </span>
//                             <button 
//                               onClick={() => handleRevoke(proj._id, proj.title)}
//                               className="text-xs bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700"
//                             >
//                               Revoke
//                             </button>
//                           </div>
//                         ) : (
//                           <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
//                             Available
//                           </span>
//                         )}
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>

//       {/* "Suggest Project" Modal (Unchanged) */}
//       {isModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
//             <h2 className="text-xl font-bold mb-4">Suggest a New Project</h2>
//             <form onSubmit={handleSuggestProject}>
//               <div className="space-y-4">
//                 <input
//                   type="text"
//                   name="title"
//                   placeholder="Project Title"
//                   value={newProject.title}
//                   onChange={handleModalChange}
//                   className="w-full p-2 border rounded"
//                   required
//                 />
//                 <textarea
//                   name="description"
//                   placeholder="Project Description"
//                   value={newProject.description}
//                   onChange={handleModalChange}
//                   className="w-full p-2 border rounded"
//                   rows="4"
//                   required
//                 />
//                 <select
//                   name="supervisor"
//                   value={newProject.supervisor}
//                   onChange={handleModalChange}
//                   className="w-full p-2 border rounded"
//                 >
//                   <option value="">Select a Supervisor (Optional)</option>
//                   {teachers.map(teacher => (
//                     <option key={teacher._id} value={teacher._id}>
//                       {teacher.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div className="flex justify-end gap-3 mt-6">
//                 <button
//                   type="button"
//                   onClick={() => setIsModalOpen(false)}
//                   className="bg-gray-400 text-white px-4 py-2 rounded"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="bg-green-600 text-white px-4 py-2 rounded"
//                 >
//                   Submit Suggestion
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* =================================== */}
//       {/* ✅ 8. RENAMED & ENHANCED "DETAILS" MODAL */}
//       {/* =================================== */}
//       {isDetailsModalOpen && selectedProposal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 py-10">
//           <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-full overflow-y-auto">
//             <h2 className="text-2xl font-bold mb-4">Proposal Details</h2>
            
//             {/* --- Proposal Info --- */}
//             <div className="space-y-4 mb-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Title</label>
//                 <p className="text-lg font-semibold">{selectedProposal.title}</p>
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Submitted By (Group)</label>
//                 <p className="font-semibold">{selectedProposal.students[0]?.group || 'N/A'}</p>
//                 <p className="text-sm text-gray-600">
//                   {selectedProposal.students.map(s => s.name).join(', ')}
//                 </p>
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Description</label>
//                 <p className="text-gray-700 text-sm bg-gray-50 p-2 border rounded max-h-32 overflow-y-auto">
//                   {selectedProposal.description || 'N/A'}
//                 </p>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">One-Pager</label>
//                 <a
//                   href={`${API_URL}/${selectedProposal.onePagerPath.replace(/\\/g, "/")}`}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   download
//                   className="text-blue-600 hover:underline font-medium"
//                 >
//                   Download One-Pager PDF
//                 </a>
//               </div>
//             </div>
            
//             {/* --- Admin Action Form --- */}
//             <form onSubmit={handleApproveProject}>
//               <div className="space-y-4">
//                 <label className="block text-sm font-medium text-gray-700">
//                   Assign a Supervisor (Optional)
//                 </label>
//                 <select
//                   name="supervisor"
//                   value={selectedSupervisorId}
//                   onChange={(e) => setSelectedSupervisorId(e.target.value)}
//                   className="w-full p-2 border rounded"
//                 >
//                   <option value="">Select a Supervisor (or assign later)</option>
//                   {teachers.map(teacher => (
//                     <option key={teacher._id} value={teacher._id}>
//                       {teacher.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* --- Modal Buttons --- */}
//               <div className="flex justify-between gap-3 mt-6">
//                 <button
//                   type="button"
//                   onClick={handleRejectProject}
//                   className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
//                   disabled={isSubmitting}
//                 >
//                   {isSubmitting ? "..." : "Reject Proposal"}
//                 </button>
//                 <div className="flex gap-3">
//                   <button
//                     type="button"
//                     onClick={closeDetailsModal}
//                     className="bg-gray-400 text-white px-4 py-2 rounded"
//                     disabled={isSubmitting}
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     className="bg-green-600 text-white px-4 py-2 rounded"
//                     disabled={isSubmitting}
//                   >
//                     {isSubmitting ? "Approving..." : "Approve Project"}
//                   </button>
//                 </div>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// }

// export default AdminDashboard;





import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiCall } from "../../api/apiCall";
import { toast } from "react-toastify";

// ✅ 1. Add API_URL for file links
const API_URL = "http://localhost:5000";

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

  // ✅ 2. Renamed state for the new "Details" modal
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [selectedSupervisorId, setSelectedSupervisorId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // ✅ 3. This function now just opens the modal
  const openDetailsModal = (proposal) => {
    setSelectedProposal(proposal);
    // Pre-fill supervisor if one was already suggested (e.g., from an application)
    setSelectedSupervisorId(proposal.supervisor?._id || "");
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedProposal(null);
    setSelectedSupervisorId("");
  };

  // ✅ 4. Renamed from handleApprovalSubmit
  const handleApproveProject = async (e) => {
    e.preventDefault();
    if (!selectedProposal) return;

    setIsSubmitting(true);
    
    // ✅ 5. NEW: Determine which API route to call
    let route;
    let data;

    if (selectedProposal.status === 'pending_onepager') {
      // This is Stage 1 approval
      route = `proposals/${selectedProposal._id}/approve-onepager`;
      data = {}; // No data needed
    } else if (selectedProposal.status === 'pending_final_approval') {
      // This is Stage 2 (Final) approval
      route = `proposals/${selectedProposal._id}/approve-final`;
      data = { supervisorId: selectedSupervisorId || null }; // Send optional supervisor
    } else {
      toast.error("Proposal is in an invalid state.");
      setIsSubmitting(false);
      return;
    }

    try {
      await ApiCall({
        route: route,
        verb: "put",
        token: token,
        data: data,
      });
      
      toast.success("Proposal approved!");
      closeDetailsModal();
      setRefreshToggle(s => !s);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to approve proposal");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ 6. New function for the modal's reject button
  const handleRejectProject = async () => {
    if (!selectedProposal) return;
    if (!window.confirm(`Are you sure you want to REJECT this proposal?\n\n"${selectedProposal.title}"`)) return;

    setIsSubmitting(true); // Disable buttons
    try {
      await ApiCall({
        route: `proposals/${selectedProposal._id}/reject`,
        verb: "put",
        token: token,
      });
      toast.success(`Proposal rejected successfully!`);
      closeDetailsModal();
      setRefreshToggle(s => !s);
    } catch (err) {
      toast.error(err?.response?.data?.message || `Failed to reject proposal`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // project revoke function (Unchanged)
  const handleRevoke = async (projectId, projectTitle) => {
    if (!window.confirm(`Are you sure you want to REVOKE this project?\n\n"${projectTitle}"\n\nThis will remove the group and supervisor.`)) return;

    try {
      await ApiCall({
        route: `projects/${projectId}/revoke`,
        verb: "put",
        token: token,
      });
      toast.success("Project assignment revoked!");
      setRefreshToggle(s => !s); // Refresh all data
    } catch (err) {
      toast.error(err?.response?.data?.message || `Failed to revoke project`);
    }
  };

  const handleModalChange = (e) => {
    setNewProject({ ...newProject, [e.target.name]: e.target.value });
  };

  const handleSuggestProject = async (e) => {
    e.preventDefault();
    
    if (!newProject.title || !newProject.description) {
      toast.error("Please fill in title and description");
      return;
    }

    try {
      await ApiCall({
        route: "projects", // POST to /api/projects
        verb: "post",
        token: token,
        data: newProject, // Sends { title, desc, supervisor: "" or "id" }
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
        
        {/* =================================== */}
        {/* ✅ 7. UPDATED PENDING PROPOSALS TABLE */}
        {/* =================================== */}
        <div className="bg-white p-4 shadow rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Pending Student Proposals</h2>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium">Title</th>
                  <th className="px-4 py-2 text-left text-sm font-medium">Group</th>
                  <th className="px-4 py-2 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-2 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {proposals.length === 0 ? (
                  <tr><td colSpan="4" className="p-4 text-center text-gray-500">No pending proposals.</td></tr>
                ) : (
                  proposals.map(prop => (
                    <tr key={prop._id} className="border-b">
                      <td className="px-4 py-2">{prop.title}</td>
                      <td className="px-4 py-2">{prop.students[0]?.group || 'N/A'}</td>
                      <td className="px-4 py-2">
                        {/* Show what step it's on */}
                        {prop.status === 'pending_onepager' && <span className="text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">One-Pager</span>}
                        {prop.status === 'pending_final_approval' && <span className="text-xs font-medium bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">Full Proposal</span>}
                      </td>
                      <td className="px-4 py-2">
                        <button 
                          onClick={() => openDetailsModal(prop)} 
                          className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* =================================== */}
        {/* ✅ 8. UPDATED "ALL PROJECTS" TABLE */}
        {/* =================================== */}
        <div className="bg-white p-4 shadow rounded-lg">
          <h2 className="text-xl font-semibold mb-4">All Projects</h2>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium">Title</th>
                  <th className="px-4 py-2 text-left text-sm font-medium">Supervisor</th>
                  <th className="px-4 py-2 text-left text-sm font-medium">Group</th>
                  <th className="px-4 py-2 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.length === 0 ? (
                  <tr><td colSpan="4" className="p-4 text-center text-gray-500">No projects found.</td></tr>
                ) : (
                  projects.map(proj => (
                    <tr key={proj._id} className="border-b">
                      <td className="px-4 py-2">{proj.title}</td>
                      <td className="px-4 py-2">{proj.supervisor?.name || 'N/A'}</td>
                      <td className="px-4 py-2">{proj.students[0]?.group || 'N/A'}</td>
                      <td className="px-4 py-2">
                        {proj.isAssigned ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                              Assigned
                            </span>
                            <button 
                              onClick={() => handleRevoke(proj._id, proj.title)}
                              className="text-xs bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700"
                            >
                              Revoke
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                            Available
                          </span>
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

      {/* "Suggest Project" Modal (Unchanged) */}
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
                >
                  <option value="">Select a Supervisor (Optional)</option>
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

      {/* =================================== */}
      {/* ✅ 9. NEW "PROPOSAL DETAILS" MODAL */}
      {/* =================================== */}
      {isDetailsModalOpen && selectedProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 py-10">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-full overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Proposal Details</h2>
            
            {/* --- Proposal Info --- */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <p className="text-lg font-semibold">{selectedProposal.title}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Submitted By (Group)</label>
                <p className="font-semibold">{selectedProposal.students[0]?.group || 'N/A'}</p>
                <p className="text-sm text-gray-600">
                  {selectedProposal.students.map(s => s.name).join(', ')}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="text-gray-700 text-sm bg-gray-50 p-2 border rounded max-h-32 overflow-y-auto">
                  {selectedProposal.description || 'N/A'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">One-Pager</label>
                <a
                  href={`${API_URL}/${selectedProposal.onePagerPath.replace(/\\/g, "/")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="text-blue-600 hover:underline font-medium"
                >
                  Download One-Pager PDF
                </a>
              </div>
              
              {/* Show full proposal if it has been submitted */}
              {selectedProposal.proposalFilePath && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Proposal</label>
                  <a
                    href={`${API_URL}/${selectedProposal.proposalFilePath.replace(/\\/g, "/")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Download Full Proposal
                  </a>
                </div>
              )}
            </div>
            
            {/* --- Admin Action Form --- */}
            <form onSubmit={handleApproveProject}>
              
              {/* Only show supervisor dropdown for FINAL approval */}
              {selectedProposal.status === 'pending_final_approval' && (
                <div className="space-y-4 mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Assign a Supervisor (Optional)
                  </label>
                  <select
                    name="supervisor"
                    value={selectedSupervisorId}
                    onChange={(e) => setSelectedSupervisorId(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select a Supervisor (or assign later)</option>
                    {teachers.map(teacher => (
                      <option key={teacher._id} value={teacher._id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* --- Modal Buttons --- */}
              <div className="flex justify-between gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleRejectProject}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "..." : "Reject Proposal"}
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeDetailsModal}
                    className="bg-gray-400 text-white px-4 py-2 rounded"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Approving..." : 
                      (selectedProposal.status === 'pending_onepager' ? "Approve One-Pager" : "Approve Final Project")
                    }
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminDashboard;