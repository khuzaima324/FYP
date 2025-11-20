// import { useEffect, useState, useMemo } from "react";
// import { ApiCall } from "../../api/apiCall"; // Still used for GET requests
// import { toast } from "react-toastify";
// import { Link } from "react-router-dom";

// // We need the API_URL for FormData fetch, as ApiCall won't work
// const API_URL = "http://localhost:5000";

// // ===================================
// // TimelineStep helper component
// // ===================================
// function TimelineStep({ title, status, fileUrl, date, children }) {
//   let statusColor = "text-gray-500";
//   let statusText = "Not Started";

//   switch (status) {
//     case "pending":
//       statusColor = "text-yellow-600";
//       statusText = "Pending Review";
//       break;
//     case "rejected":
//       statusColor = "text-red-600";
//       statusText = "Rejected";
//       break;
//     case "waiting":
//       statusColor = "text-gray-500";
//       statusText = "Waiting";
//       break;
//     case "ready":
//       statusColor = "text-blue-600";
//       statusText = "Ready to Submit";
//       break;
//     case "complete":
//       statusColor = "text-green-600";
//       statusText = "Completed";
//       break;
//     default:
//       statusColor = "text-gray-500";
//       statusText = "Not Started";
//   }

//   const formatDate = (dateString) => {
//     if (!dateString) return null;
//     try {
//       return new Date(dateString).toLocaleString("en-US", {
//         year: "numeric",
//         month: "long",
//         day: "numeric",
//         hour: "2-digit",
//         minute: "2-digit",
//       });
//     } catch {
//       return null;
//     }
//   };

//   const formattedDate = formatDate(date);

//   return (
//     <div className="bg-white p-4 rounded-lg shadow border">
//       <div className="flex justify-between items-center">
//         <h3 className="text-lg font-semibold">{title}</h3>
//         <span className={`font-semibold text-sm ${statusColor}`}>{statusText}</span>
//       </div>

//       {formattedDate && (status === "complete" || status === "pending") && (
//         <p className="text-xs text-gray-500">Submitted: {formattedDate}</p>
//       )}

//       {fileUrl && (
//         <a
//           href={`${API_URL}/${fileUrl.replace(/\\/g, "/")}`}
//           target="_blank"
//           rel="noopener noreferrer"
//           download
//           className="text-sm text-blue-600 hover:underline"
//         >
//           View Submitted File
//         </a>
//       )}

//       <div className="mt-3">{children}</div>
//     </div>
//   );
// }

// function StudentDashboard() {
//   const [dashboardData, setDashboardData] = useState({});
//   const [myProposals, setMyProposals] = useState([]);
//   const [teachers, setTeachers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshToggle, setRefreshToggle] = useState(false);

//   // State for the "Propose Project" modal
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   // ===================================
//   // ✅ 1. ADDED NEW FIELDS TO STATE
//   // ===================================
//   const [newProposal, setNewProposal] = useState({
//     title: "",
//     description: "",
//     groupName: "",
//     memberRollNumbers: "",
//   });

//   // ✅ States for file upload
//   const [onePagerFile, setOnePagerFile] = useState(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // ✅ NEW: State for "Submit Full Proposal" modal
//   const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
//   const [proposalFile, setProposalFile] = useState(null);
//   const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);

//   // State for "Submit Final Documentation" modal
//   const [isDocModalOpen, setIsDocModalOpen] = useState(false);
//   const [projectLink, setProjectLink] = useState("");
//   const [docFile, setDocFile] = useState(null);
//   const [isSubmittingDocs, setIsSubmittingDocs] = useState(false);

//   const token = JSON.parse(localStorage.getItem("userInfo"))?.token || null;

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         // Fetch all dashboard data
//         const [dataRes, proposalsRes, teachersRes] = await Promise.all([
//           ApiCall({ route: "student/dashboard-data", verb: "get", token: token }),
//           ApiCall({ route: "proposals/my-proposals", verb: "get", token: token }),
//           ApiCall({ route: "teachers", verb: "get", token: token }),
//         ]);

//         setDashboardData(dataRes || {});
//         setMyProposals(Array.isArray(proposalsRes) ? proposalsRes : []);
//         setTeachers(Array.isArray(teachersRes) ? teachersRes : []);
//       } catch (err) {
//         toast.error("Failed to fetch dashboard data: " + (err?.message || err));
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [refreshToggle, token]);

//   const handleModalChange = (e) => {
//     setNewProposal({ ...newProposal, [e.target.name]: e.target.value });
//   };

//   // --- STAGE 1: Submit One-Pager ---
//   // ✅ 2. UPDATED to send group info
//   const handleOnePagerSubmit = async (e) => {
//     e.preventDefault();
//     if (!newProposal.title || !onePagerFile || !newProposal.groupName) {
//       toast.error("Please provide a Title, Group Name, and a One-Pager PDF.");
//       return;
//     }

//     setIsSubmitting(true);
//     const formData = new FormData();
//     formData.append("title", newProposal.title);
//     formData.append("description", newProposal.description || "N/A");
//     formData.append("onePager", onePagerFile);
//     formData.append("groupName", newProposal.groupName);
//     formData.append("memberRollNumbers", newProposal.memberRollNumbers);

//     try {
//       const res = await fetch(`${API_URL}/api/proposals`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         body: formData,
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.message || "Submission failed");

//       toast.success("One-Pager submitted successfully!");
//       setIsModalOpen(false);
//       // Reset form
//       setNewProposal({ title: "", description: "", groupName: "", memberRollNumbers: "" });
//       setOnePagerFile(null);
//       setRefreshToggle((s) => !s);
//     } catch (err) {
//       toast.error(err?.message || "Failed to submit One-Pager");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // --- STAGE 2: Submit Full Proposal ---
//   const handleFullProposalSubmit = async (e) => {
//     e.preventDefault();
//     if (!proposalFile) {
//       toast.error("Please upload your Full Proposal file.");
//       return;
//     }

//     const activeProposal = myProposals.find((p) => p.status === "pending_proposal");
//     if (!activeProposal) {
//       toast.error("Could not find active proposal to update.");
//       return;
//     }

//     setIsSubmittingProposal(true);
//     const formData = new FormData();
//     formData.append("proposalFile", proposalFile);

//     try {
//       const res = await fetch(`${API_URL}/api/proposals/${activeProposal._id}/submit-proposal`, {
//         method: "PUT",
//         headers: { Authorization: `Bearer ${token}` },
//         body: formData,
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.message || "Submission failed");

//       toast.success("Full Proposal submitted successfully!");
//       setIsProposalModalOpen(false);
//       setProposalFile(null);
//       setRefreshToggle((s) => !s);
//     } catch (err) {
//       toast.error(err?.message || "Failed to submit proposal");
//     } finally {
//       setIsSubmittingProposal(false);
//     }
//   };

//   // --- STAGE 3: Submit Final Documentation ---
//   const handleDocSubmit = async (e) => {
//     e.preventDefault();
//     if (!docFile) {
//       toast.error("Please upload your final documentation file.");
//       return;
//     }

//     setIsSubmittingDocs(true);
//     const formData = new FormData();
//     formData.append("documentation", docFile);
//     formData.append("projectLink", projectLink || "");

//     try {
//       const res = await fetch(`${API_URL}/api/projects/submit-documentation`, {
//         method: "PUT",
//         headers: { Authorization: `Bearer ${token}` },
//         body: formData,
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.message || "Submission failed");

//       toast.success("Final documentation submitted successfully!");
//       setIsDocModalOpen(false);
//       setDocFile(null);
//       setProjectLink("");
//       setRefreshToggle((s) => !s);
//     } catch (err) {
//       toast.error(err?.message || "Failed to submit documentation");
//     } finally {
//       setIsSubmittingDocs(false);
//     }
//   };

//   const getStatusClass = (status) => {
//     if (status === "approved") return "text-green-600 bg-green-100";
//     if (status === "rejected") return "text-red-600 bg-red-100";
//     if (status === "pending_proposal") return "text-blue-600 bg-blue-100";
//     if (status === "pending_final_approval") return "text-purple-600 bg-purple-100";
//     if (status === "pending_onepager") return "text-yellow-600 bg-yellow-100";
//     return "text-gray-600 bg-gray-100";
//   };

//   const getCurrentStep = () => {
//     const { project } = dashboardData || {};

//     // Check for highest step first
//     if (project && project.documentationPath) {
//       return "Step 4: Project Complete"; // Final docs are submitted
//     }
//     if (project) {
//       return "Step 3: Submit Final Documentation"; // Project is approved, waiting for docs
//     }

//     // No approved project, so check proposals
//     const proposalPendingFinal = myProposals.some((p) => p.status === "pending_final_approval");
//     const onePagerApproved = myProposals.some((p) => p.status === "pending_proposal");
//     const onePagerPending = myProposals.some((p) => p.status === "pending_onepager");

//     if (proposalPendingFinal) return "Step 2: Proposal Pending"; // Full proposal is pending
//     if (onePagerApproved) return "Step 2: Submit Full Proposal"; // One-pager approved
//     if (onePagerPending) return "Step 1: One-Pager Pending"; // One-pager pending

//     return "Step 1: Get a Project"; // No project, no proposals
//   };

//   const currentStep = !loading ? getCurrentStep() : "";

//   // This is your useMemo hook, preserved
//   const activeProposal = useMemo(() => {
//     if (dashboardData?.project) {
//       const originalProposal = myProposals.find((p) => p.status === "approved");
//       return { ...(dashboardData.project || {}), ...(originalProposal || {}), status: "approved" };
//     }
//     return myProposals.find((p) => p.status !== "rejected");
//   }, [dashboardData?.project, myProposals]);

//   if (loading) return <p className="text-center mt-10">Loading dashboard...</p>;

//   return (
//     <div className="p-6">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">Student Dashboard</h1>
//         {/* Only show propose button if they are on Step 1 */}
//         {currentStep === "Step 1: Get a Project" && (
//           <button onClick={() => setIsModalOpen(true)} className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700">
//             Create Group & Propose Project
//           </button>
//         )}
//       </div>

//       {/* --- Main Info Grid --- */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//         {/* --- "PROJECT STATUS" CARD --- */}
//         <div className="bg-white p-6 shadow rounded-lg">
//           <h2 className="text-xl font-semibold mb-4">Project Status</h2>

//           {/* --- Step 1: No Project --- */}
//           {currentStep === "Step 1: Get a Project" && (
//             <div className="text-center p-4 bg-gray-50 rounded">
//               <h3 className="font-semibold text-lg text-gray-800">Step 1: Get a Project</h3>
//               <p className="text-gray-600 mt-2">You are not assigned to a project yet. You can either propose a new idea or apply for an existing one.</p>
//               <Link to="/projects" className="inline-block mt-4 text-[#a96a3f] font-medium hover:underline">
//                 Browse available projects
//               </Link>
//             </div>
//           )}

//           {/* --- Step 1: One-Pager Pending --- */}
//           {currentStep === "Step 1: One-Pager Pending" && (
//             <div className="text-center p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
//               <h3 className="font-semibold text-lg text-yellow-800">Step 1: One-Pager Pending</h3>
//               <p className="text-yellow-700 mt-2">Your group's One-Pager is under review by the admin. Please check the "Project Timeline" below for details.</p>
//             </div>
//           )}

//           {/* --- Step 2: Submit Full Proposal --- */}
//           {currentStep === "Step 2: Submit Full Proposal" && (
//             <div className="p-3 bg-blue-100 border border-blue-300 rounded-lg">
//               <h4 className="font-semibold text-blue-800">Step 2: Submit Full Proposal</h4>
//               <p className="text-sm text-blue-700">Your One-Pager was approved! Please submit your full, detailed proposal for final review.</p>
//               <button onClick={() => setIsProposalModalOpen(true)} className="mt-2 bg-blue-600 text-white px-3 py-1 rounded shadow hover:bg-blue-700 text-sm font-medium">
//                 Submit Full Proposal
//               </button>
//             </div>
//           )}

//           {/* --- Step 2: Proposal Pending --- */}
//           {currentStep === "Step 2: Proposal Pending" && (
//             <div className="text-center p-4 bg-purple-100 border border-purple-300 rounded-lg">
//               <h3 className="font-semibold text-lg text-purple-800">Step 2: Proposal Pending</h3>
//               <p className="text-purple-700 mt-2">Your group's Full Proposal is under final review. Please check the "Project Timeline" below for details.</p>
//             </div>
//           )}

//           {/* --- Step 3: Project in Progress --- */}
//           {currentStep === "Step 3: Submit Final Documentation" && dashboardData.project && (
//             <div>
//               <h3 className="text-lg font-bold text-[#a96a3f]">{dashboardData.project.title}</h3>
//               <p className="text-gray-700 mt-2">{dashboardData.project.description}</p>

//               <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
//                 <h4 className="font-semibold text-yellow-800">Step 3: Submit Final Documentation</h4>
//                 <p className="text-sm text-yellow-700">Your project is in progress. Please submit your final documentation when ready.</p>
//                 <button onClick={() => setIsDocModalOpen(true)} className="mt-2 bg-yellow-600 text-white px-3 py-1 rounded shadow hover:bg-yellow-700 text-sm font-medium">
//                   Submit Final Documentation
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* --- Step 4: Project Complete --- */}
//           {currentStep === "Step 4: Project Complete" && dashboardData.project && (
//             <div>
//               <h3 className="text-lg font-bold text-[#a96a3f]">{dashboardData.project.title}</h3>
//               <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg">
//                 <h4 className="font-semibold text-green-800">Step 4: Project Completed!</h4>
//                 <p className="text-sm text-green-700">You have submitted your final documentation.</p>
//                 <div className="flex gap-4 mt-2">
//                   {dashboardData.project?.documentationPath && (
//                     <a
//                       href={`${API_URL}/${dashboardData.project.documentationPath.replace(/\\/g, "/")}`}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       download
//                       className="text-blue-600 hover:underline font-medium text-sm"
//                     >
//                       View Your Submission
//                     </a>
//                   )}
//                   {dashboardData.project?.projectLink && (
//                     <a
//                       href={dashboardData.project.projectLink.startsWith("http") ? dashboardData.project.projectLink : `http://${dashboardData.project.projectLink}`}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-blue-600 hover:underline font-medium text-sm"
//                     >
//                       View Project Link
//                     </a>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* My Group & Supervisor */}
//         <div className="bg-white p-6 shadow rounded-lg">
//           <h2 className="text-xl font-semibold mb-4">My Details</h2>
//           <div className="space-y-3">
//             <p>
//               <strong>Supervisor:</strong> {dashboardData.student?.supervisor?.name || "Not Assigned"}
//             </p>
//             <p>
//               <strong>Group:</strong> <span className="font-semibold">{dashboardData.student?.group || "Not Assigned"}</span>
//             </p>

//             {dashboardData.student?.group && (
//               <div className="pt-2">
//                 <h3 className="font-semibold text-gray-800">Group Members:</h3>
//                 <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
//                   {dashboardData.student && (
//                     <li>
//                       {dashboardData.student.name} ({dashboardData.student.rollNumber}) (You)
//                     </li>
//                   )}
//                   {(dashboardData.groupMembers || []).map((member) => (
//                     <li key={member._id}>
//                       {member.name} ({member.rollNumber})
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* --- "PROJECT TIMELINE" MODULE --- */}
//       {activeProposal && (
//         <div className="bg-white p-6 shadow rounded-lg mb-6">
//           <h2 className="text-xl font-semibold mb-4">Project Timeline: {activeProposal.title}</h2>
//           <div className="space-y-4">
//             {/* --- TIMELINE STEP 1: ONE-PAGER --- */}
//             <TimelineStep
//               title="Step 1: One-Pager"
//               status={activeProposal.status === "pending_onepager" ? "pending" : activeProposal.status === "rejected" ? "rejected" : "complete"}
//               fileUrl={activeProposal.onePagerPath}
//               date={activeProposal.createdAt}
//             >
//               {activeProposal.status === "rejected" && <p className="text-red-600 text-sm">Your proposal was rejected. You may need to submit a new proposal.</p>}
//             </TimelineStep>

//             {/* --- TIMELINE STEP 2: FULL PROPOSAL --- */}
//             <TimelineStep
//               title="Step 2: Full Proposal"
//               status={
//                 activeProposal.status === "pending_onepager"
//                   ? "waiting"
//                   : activeProposal.status === "pending_proposal"
//                   ? "ready"
//                   : activeProposal.status === "pending_final_approval"
//                   ? "pending"
//                   : activeProposal.status === "rejected"
//                   ? "rejected"
//                   : "complete"
//               }
//               fileUrl={activeProposal.proposalFilePath}
//               date={activeProposal.proposalFilePath ? activeProposal.updatedAt : null}
//             >
//               {currentStep === "Step 2: Submit Full Proposal" && (
//                 <button onClick={() => setIsProposalModalOpen(true)} className="mt-2 bg-blue-600 text-white px-3 py-1 rounded shadow hover:bg-blue-700 text-sm font-medium">
//                   Submit Full Proposal
//                 </button>
//               )}
//             </TimelineStep>

//             {/* --- TIMELINE STEP 3: FINAL DOCUMENTATION --- */}
//             <TimelineStep
//               title="Step 3: Final Documentation"
//               status={!dashboardData.project ? "waiting" : dashboardData.project.documentationPath ? "complete" : "ready"}
//               fileUrl={dashboardData.project?.documentationPath}
//               date={dashboardData.project?.documentationPath ? dashboardData.project.updatedAt : null}
//             >
//               {currentStep === "Step 3: Submit Final Documentation" && (
//                 <button onClick={() => setIsDocModalOpen(true)} className="mt-2 bg-blue-600 text-white px-3 py-1 rounded shadow hover:bg-blue-700 text-sm font-medium">
//                   Submit Final Documentation
//                 </button>
//               )}
//               {currentStep === "Step 4: Project Complete" && <p className="text-sm text-green-700">Your final documentation has been submitted.</p>}
//             </TimelineStep>
//           </div>
//         </div>
//       )}

//       {/* --- My Proposals (This table is now a history log) --- */}
//       <div className="bg-white p-6 shadow rounded-lg">
//         <h2 className="text-xl font-semibold mb-4">My Proposal History</h2>
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className="bg-gray-50">
//                 <th className="px-4 py-2 text-left text-sm font-medium">Title</th>
//                 <th className="px-4 py-2 text-left text-sm font-medium">Supervisor</th>
//                 <th className="px-4 py-2 text-left text-sm font-medium">Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {myProposals.length === 0 ? (
//                 <tr>
//                   <td colSpan="3" className="p-4 text-center text-gray-500">
//                     You have not submitted any proposals.
//                   </td>
//                 </tr>
//               ) : (
//                 myProposals.map((prop) => (
//                   <tr key={prop._id} className="border-b">
//                     <td className="px-4 py-2">{prop.title}</td>
//                     <td className="px-4 py-2">{prop.supervisor?.name || "N/A"}</td>
//                     <td className="px-4 py-2">
//                       <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusClass(prop.status)}`}>
//                         {prop.status === "pending_onepager" && "One-Pager Pending"}
//                         {prop.status === "pending_proposal" && "One-Pager Approved (Submit Proposal)"}
//                         {prop.status === "pending_final_approval" && "Proposal Pending"}
//                         {prop.status === "approved" && "Project Approved"}
//                         {prop.status === "rejected" && "Rejected"}
//                       </span>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* =================================== */}
//       {/* ✅ 7. UPDATED "PROPOSE PROJECT" MODAL */}
//       {/* =================================== */}
//       {isModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
//             <h2 className="text-xl font-bold mb-4">Create Group & Propose Project (Step 1)</h2>
//             <form onSubmit={handleOnePagerSubmit}>
//               <div className="space-y-4">
//                 {/* --- New Group Fields --- */}
//                 <div className="border-b pb-4">
//                   <h3 className="text-lg font-medium text-gray-900">Group Details</h3>
//                   <p className="text-sm text-gray-500">Create your group. You will be the group leader.</p>
//                   <input
//                     type="text"
//                     name="groupName"
//                     placeholder="Group Name (e.g., 'G1' or 'Innovators')"
//                     value={newProposal.groupName}
//                     onChange={handleModalChange}
//                     className="w-full p-2 border rounded mt-2"
//                     required
//                   />
//                   <input
//                     type="text"
//                     name="memberRollNumbers"
//                     placeholder="Other Member Roll Numbers (comma-separated)"
//                     value={newProposal.memberRollNumbers}
//                     onChange={handleModalChange}
//                     className="w-full p-2 border rounded mt-2"
//                   />
//                 </div>

//                 {/* --- Project Details --- */}
//                 <div className="pt-4">
//                   <h3 className="text-lg font-medium text-gray-900">Project Details</h3>
//                   <input
//                     type="text"
//                     name="title"
//                     placeholder="Project Title"
//                     value={newProposal.title}
//                     onChange={handleModalChange}
//                     className="w-full p-2 border rounded mt-2"
//                     required
//                   />
//                   <textarea
//                     name="description"
//                     placeholder="Project Description (Optional)"
//                     value={newProposal.description}
//                     onChange={handleModalChange}
//                     className="w-full p-2 border rounded mt-2"
//                     rows="3"
//                   />
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">Upload One-Pager (PDF Required)</label>
//                     <input
//                       type="file"
//                       name="onePager"
//                       accept=".pdf"
//                       onChange={(e) => setOnePagerFile(e.target.files?.[0] || null)}
//                       className="w-full p-2 border rounded file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#a96a3f] file:text-white hover:file:opacity-90"
//                       required
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div className="flex justify-end gap-3 mt-6">
//                 <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-400 text-white px-4 py-2 rounded" disabled={isSubmitting}>
//                   Cancel
//                 </button>
//                 <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded" disabled={isSubmitting}>
//                   {isSubmitting ? "Submitting..." : "Create Group & Submit"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* "Submit Full Proposal" Modal */}
//       {isProposalModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
//             <h2 className="text-xl font-bold mb-4">Submit Full Proposal (Step 2)</h2>
//             <form onSubmit={handleFullProposalSubmit}>
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Upload Full Proposal (PDF/DOCX)</label>
//                   <input
//                     type="file"
//                     name="proposalFile"
//                     accept=".pdf,.doc,.docx"
//                     onChange={(e) => setProposalFile(e.target.files?.[0] || null)}
//                     className="w-full p-2 border rounded file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#a96a3f] file:text-white hover:file:opacity-90"
//                     required
//                   />
//                 </div>
//               </div>
//               <div className="flex justify-end gap-3 mt-6">
//                 <button type="button" onClick={() => setIsProposalModalOpen(false)} className="bg-gray-400 text-white px-4 py-2 rounded" disabled={isSubmittingProposal}>
//                   Cancel
//                 </button>
//                 <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded" disabled={isSubmittingProposal}>
//                   {isSubmittingProposal ? "Submitting..." : "Submit Proposal"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* "Submit Final Documentation" Modal */}
//       {isDocModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
//             <h2 className="text-xl font-bold mb-4">Submit Final Deliverables</h2>
//             <form onSubmit={handleDocSubmit}>
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Project Link (GitHub, Vercel, etc.)</label>
//                   <input type="text" name="projectLink" placeholder="https://github.com/..." value={projectLink} onChange={(e) => setProjectLink(e.target.value)} className="w-full p-2 border rounded" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Final Documentation (PDF/DOCX)</label>
//                   <input
//                     type="file"
//                     name="documentation"
//                     accept=".pdf,.doc,.docx"
//                     onChange={(e) => setDocFile(e.target.files?.[0] || null)}
//                     className="w-full p-2 border rounded file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#a96a3f] file:text-white hover:file:opacity-90"
//                     required
//                   />
//                 </div>
//               </div>
//               <div className="flex justify-end gap-3 mt-6">
//                 <button type="button" onClick={() => setIsDocModalOpen(false)} className="bg-gray-400 text-white px-4 py-2 rounded" disabled={isSubmittingDocs}>
//                   Cancel
//                 </button>
//                 <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded" disabled={isSubmittingDocs}>
//                   {isSubmittingDocs ? "Submitting..." : "Submit Project"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default StudentDashboard;

// import { useEffect, useState, useMemo } from "react";
// import { ApiCall } from "../../api/apiCall";
// import { toast } from "react-toastify";
// import { Link } from "react-router-dom";

// // We need this for the file upload fetch calls
// const API_URL = "http://localhost:5000";

// // ===================================
// // TimelineStep Helper Component
// // ===================================
// function TimelineStep({ title, status, fileUrl, date, children }) {
//   let statusColor = "text-gray-500";
//   let statusText = "Not Started";

//   switch (status) {
//     case "pending":
//       statusColor = "text-yellow-600";
//       statusText = "Pending Review";
//       break;
//     case "rejected":
//       statusColor = "text-red-600";
//       statusText = "Rejected";
//       break;
//     case "waiting":
//       statusColor = "text-gray-500";
//       statusText = "Waiting";
//       break;
//     case "ready":
//       statusColor = "text-blue-600";
//       statusText = "Ready to Submit";
//       break;
//     case "complete":
//       statusColor = "text-green-600";
//       statusText = "Completed";
//       break;
//     default:
//       statusColor = "text-gray-500";
//       statusText = "Not Started";
//   }

//   const formatDate = (dateString) => {
//     if (!dateString) return null;
//     try {
//       return new Date(dateString).toLocaleString("en-US", {
//         year: "numeric",
//         month: "long",
//         day: "numeric",
//         hour: "2-digit",
//         minute: "2-digit",
//       });
//     } catch {
//       return null;
//     }
//   };

//   const formattedDate = formatDate(date);

//   return (
//     <div className="bg-white p-4 rounded-lg shadow border">
//       <div className="flex justify-between items-center">
//         <h3 className="text-lg font-semibold">{title}</h3>
//         <span className={`font-semibold text-sm ${statusColor}`}>{statusText}</span>
//       </div>

//       {formattedDate && (status === "complete" || status === "pending") && (
//         <p className="text-xs text-gray-500">Submitted: {formattedDate}</p>
//       )}

//       {fileUrl && (
//         <a
//           href={`${API_URL}/${fileUrl.replace(/\\/g, "/")}`}
//           target="_blank"
//           rel="noopener noreferrer"
//           download
//           className="text-sm text-blue-600 hover:underline"
//         >
//           View Submitted File
//         </a>
//       )}

//       <div className="mt-3">{children}</div>
//     </div>
//   );
// }

// // ===================================
// // Student Dashboard Main Component
// // ===================================
// function StudentDashboard() {
//   // Data State
//   const [dashboardData, setDashboardData] = useState({});
//   const [myProposals, setMyProposals] = useState([]);
//   const [teachers, setTeachers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshToggle, setRefreshToggle] = useState(false);

//   const token = JSON.parse(localStorage.getItem("userInfo"))?.token || null;

//   // --- MODAL STATES ---

//   // 1. Create Group & One-Pager Modal
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [newProposal, setNewProposal] = useState({
//     title: "",
//     description: "",
//     groupName: "",
//     memberRollNumbers: "",
//   });
//   const [onePagerFile, setOnePagerFile] = useState(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // 2. Submit Full Proposal Modal
//   const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
//   const [proposalFile, setProposalFile] = useState(null);
//   const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);

//   // 3. Submit Final Documentation Modal
//   const [isDocModalOpen, setIsDocModalOpen] = useState(false);
//   const [projectLink, setProjectLink] = useState("");
//   const [docFile, setDocFile] = useState(null);
//   const [isSubmittingDocs, setIsSubmittingDocs] = useState(false);

//   // ===================================
//   // Fetch Data
//   // ===================================
//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         const [dataRes, proposalsRes, teachersRes] = await Promise.all([
//           ApiCall({ route: "student/dashboard-data", verb: "get", token }),
//           ApiCall({ route: "proposals/my-proposals", verb: "get", token }),
//           ApiCall({ route: "teachers", verb: "get", token }),
//         ]);

//         setDashboardData(dataRes || {});
//         setMyProposals(Array.isArray(proposalsRes) ? proposalsRes : []);
//         setTeachers(Array.isArray(teachersRes) ? teachersRes : []);
//       } catch (err) {
//         toast.error("Failed to fetch dashboard data: " + (err?.message || err));
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [refreshToggle, token]);

//   // Helper for input changes
//   const handleModalChange = (e) => {
//     setNewProposal({ ...newProposal, [e.target.name]: e.target.value });
//   };

//   // ===================================
//   // Handlers
//   // ===================================

//   // 1. Submit One-Pager (Creates Group)
//   const handleOnePagerSubmit = async (e) => {
//     e.preventDefault();
//     if (!newProposal.title || !onePagerFile || !newProposal.groupName) {
//       toast.error("Please provide a Title, Group Name, and a One-Pager PDF.");
//       return;
//     }

//     setIsSubmitting(true);
//     const formData = new FormData();
//     formData.append("title", newProposal.title);
//     formData.append("description", newProposal.description || "N/A");
//     formData.append("onePager", onePagerFile);
//     formData.append("groupName", newProposal.groupName);
//     formData.append("memberRollNumbers", newProposal.memberRollNumbers);

//     try {
//       const res = await fetch(`${API_URL}/api/proposals`, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}` },
//         body: formData,
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.message || "Submission failed");

//       toast.success("One-Pager submitted successfully!");
//       setIsModalOpen(false);
//       setNewProposal({ title: "", description: "", groupName: "", memberRollNumbers: "" });
//       setOnePagerFile(null);
//       setRefreshToggle((s) => !s);
//     } catch (err) {
//       toast.error(err?.message || "Failed to submit One-Pager");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // 2. Submit Full Proposal
//   const handleFullProposalSubmit = async (e) => {
//     e.preventDefault();
//     if (!proposalFile) {
//       toast.error("Please upload your Full Proposal file.");
//       return;
//     }

//     const activeProposal = myProposals.find((p) => p.status === "pending_proposal");
//     if (!activeProposal) {
//       toast.error("Could not find active proposal to update.");
//       return;
//     }

//     setIsSubmittingProposal(true);
//     const formData = new FormData();
//     formData.append("proposalFile", proposalFile);

//     try {
//       const res = await fetch(`${API_URL}/api/proposals/${activeProposal._id}/submit-proposal`, {
//         method: "PUT",
//         headers: { Authorization: `Bearer ${token}` },
//         body: formData,
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.message || "Submission failed");

//       toast.success("Full Proposal submitted successfully!");
//       setIsProposalModalOpen(false);
//       setProposalFile(null);
//       setRefreshToggle((s) => !s);
//     } catch (err) {
//       toast.error(err?.message || "Failed to submit proposal");
//     } finally {
//       setIsSubmittingProposal(false);
//     }
//   };

//   // 3. Submit Final Documentation
//   const handleDocSubmit = async (e) => {
//     e.preventDefault();
//     if (!docFile) {
//       toast.error("Please upload your final documentation file.");
//       return;
//     }

//     setIsSubmittingDocs(true);
//     const formData = new FormData();
//     formData.append("documentation", docFile);
//     formData.append("projectLink", projectLink || "");

//     try {
//       const res = await fetch(`${API_URL}/api/projects/submit-documentation`, {
//         method: "PUT",
//         headers: { Authorization: `Bearer ${token}` },
//         body: formData,
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.message || "Submission failed");

//       toast.success("Final documentation submitted successfully!");
//       setIsDocModalOpen(false);
//       setDocFile(null);
//       setProjectLink("");
//       setRefreshToggle((s) => !s);
//     } catch (err) {
//       toast.error(err?.message || "Failed to submit documentation");
//     } finally {
//       setIsSubmittingDocs(false);
//     }
//   };

//   // ===================================
//   // Helpers for UI Logic
//   // ===================================
//   const getStatusClass = (status) => {
//     if (status === "approved") return "text-green-600 bg-green-100";
//     if (status === "rejected") return "text-red-600 bg-red-100";
//     if (status === "pending_proposal") return "text-blue-600 bg-blue-100";
//     if (status === "pending_final_approval") return "text-purple-600 bg-purple-100";
//     if (status === "pending_onepager") return "text-yellow-600 bg-yellow-100";
//     return "text-gray-600 bg-gray-100";
//   };

//   const getCurrentStep = () => {
//     const { project } = dashboardData || {};

//     if (project && project.documentationPath) return "Step 4: Project Complete";
//     if (project) return "Step 3: Submit Final Documentation";

//     const proposalPendingFinal = myProposals.some((p) => p.status === "pending_final_approval");
//     const onePagerApproved = myProposals.some((p) => p.status === "pending_proposal");
//     const onePagerPending = myProposals.some((p) => p.status === "pending_onepager");

//     if (proposalPendingFinal) return "Step 2: Proposal Pending";
//     if (onePagerApproved) return "Step 2: Submit Full Proposal";
//     if (onePagerPending) return "Step 1: One-Pager Pending";

//     return "Step 1: Get a Project";
//   };

//   const currentStep = !loading ? getCurrentStep() : "";

//   // Merge Project Data with Proposal Data for the Timeline
//   const activeProposal = useMemo(() => {
//     if (dashboardData?.project) {
//       const originalProposal = myProposals.find((p) => p.status === "approved");
//       return { ...(dashboardData.project || {}), ...(originalProposal || {}), status: "approved" };
//     }
//     return myProposals.find((p) => p.status !== "rejected");
//   }, [dashboardData?.project, myProposals]);

//   if (loading) return <p className="text-center mt-10">Loading dashboard...</p>;

//   return (
//     <div className="p-6">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">Student Dashboard</h1>
//         {/* Only show propose button if they are on Step 1 */}
//         {currentStep === "Step 1: Get a Project" && (
//           <button onClick={() => setIsModalOpen(true)} className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700">
//             Create Group & Propose Project
//           </button>
//         )}
//       </div>

//       {/* --- Main Info Grid --- */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        
//         {/* 1. PROJECT STATUS CARD */}
//         <div className="bg-white p-6 shadow rounded-lg">
//           <h2 className="text-xl font-semibold mb-4">Project Status</h2>

//           {/* Step 1: No Project */}
//           {currentStep === "Step 1: Get a Project" && (
//             <div className="text-center p-4 bg-gray-50 rounded">
//               <h3 className="font-semibold text-lg text-gray-800">Step 1: Get a Project</h3>
//               <p className="text-gray-600 mt-2">You are not assigned to a project yet. You can either propose a new idea or apply for an existing one.</p>
//               <Link to="/projects" className="inline-block mt-4 text-[#a96a3f] font-medium hover:underline">
//                 Browse available projects
//               </Link>
//             </div>
//           )}

//           {/* Step 1: One-Pager Pending */}
//           {currentStep === "Step 1: One-Pager Pending" && (
//             <div className="text-center p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
//               <h3 className="font-semibold text-lg text-yellow-800">Step 1: One-Pager Pending</h3>
//               <p className="text-yellow-700 mt-2">Your group's One-Pager is under review by the admin. Please check the "Project Timeline" below for details.</p>
//             </div>
//           )}

//           {/* Step 2: Submit Full Proposal */}
//           {currentStep === "Step 2: Submit Full Proposal" && (
//             <div className="p-3 bg-blue-100 border border-blue-300 rounded-lg">
//               <h4 className="font-semibold text-blue-800">Step 2: Submit Full Proposal</h4>
//               <p className="text-sm text-blue-700">Your One-Pager was approved! Please submit your full, detailed proposal for final review.</p>
//               <button onClick={() => setIsProposalModalOpen(true)} className="mt-2 bg-blue-600 text-white px-3 py-1 rounded shadow hover:bg-blue-700 text-sm font-medium">
//                 Submit Full Proposal
//               </button>
//             </div>
//           )}

//           {/* Step 2: Proposal Pending */}
//           {currentStep === "Step 2: Proposal Pending" && (
//             <div className="text-center p-4 bg-purple-100 border border-purple-300 rounded-lg">
//               <h3 className="font-semibold text-lg text-purple-800">Step 2: Proposal Pending</h3>
//               <p className="text-purple-700 mt-2">Your group's Full Proposal is under final review. Please check the "Project Timeline" below for details.</p>
//             </div>
//           )}

//           {/* Step 3: Project in Progress */}
//           {currentStep === "Step 3: Submit Final Documentation" && dashboardData.project && (
//             <div>
//               <h3 className="text-lg font-bold text-[#a96a3f]">{dashboardData.project.title}</h3>
//               <p className="text-gray-700 mt-2">{dashboardData.project.description}</p>
//               <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
//                 <h4 className="font-semibold text-yellow-800">Step 3: Submit Final Documentation</h4>
//                 <p className="text-sm text-yellow-700">Your project is in progress. Please submit your final documentation when ready.</p>
//                 <button onClick={() => setIsDocModalOpen(true)} className="mt-2 bg-yellow-600 text-white px-3 py-1 rounded shadow hover:bg-yellow-700 text-sm font-medium">
//                   Submit Final Documentation
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Step 4: Project Complete */}
//           {currentStep === "Step 4: Project Complete" && dashboardData.project && (
//             <div>
//               <h3 className="text-lg font-bold text-[#a96a3f]">{dashboardData.project.title}</h3>
//               <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg">
//                 <h4 className="font-semibold text-green-800">Step 4: Project Completed!</h4>
//                 <p className="text-sm text-green-700">You have submitted your final documentation.</p>
//                 <div className="flex gap-4 mt-2">
//                   {dashboardData.project?.documentationPath && (
//                     <a
//                       href={`${API_URL}/${dashboardData.project.documentationPath.replace(/\\/g, "/")}`}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       download
//                       className="text-blue-600 hover:underline font-medium text-sm"
//                     >
//                       View Your Submission
//                     </a>
//                   )}
//                   {dashboardData.project?.projectLink && (
//                     <a
//                       href={dashboardData.project.projectLink.startsWith("http") ? dashboardData.project.projectLink : `http://${dashboardData.project.projectLink}`}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-blue-600 hover:underline font-medium text-sm"
//                     >
//                       View Project Link
//                     </a>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* 2. GROUP & DETAILS CARD */}
//         <div className="bg-white p-6 shadow rounded-lg">
//           <h2 className="text-xl font-semibold mb-4">My Details</h2>
//           <div className="space-y-3">
//             <p>
//               <strong>Supervisor:</strong> {dashboardData.student?.supervisor?.name || "Not Assigned"}
//             </p>
//             <p>
//               <strong>Group:</strong> <span className="font-semibold">{dashboardData.student?.group || "Not Assigned"}</span>
//             </p>

//             {dashboardData.student?.group && (
//               <div className="pt-2">
//                 <h3 className="font-semibold text-gray-800">Group Members:</h3>
//                 <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
//                   {dashboardData.student && (
//                     <li>
//                       {dashboardData.student.name} ({dashboardData.student.rollNumber}) (You)
//                     </li>
//                   )}
//                   {(dashboardData.groupMembers || []).map((member) => (
//                     <li key={member._id}>
//                       {member.name} ({member.rollNumber})
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* --- PROJECT TIMELINE --- */}
//       {activeProposal && (
//         <div className="bg-white p-6 shadow rounded-lg mb-6">
//           <h2 className="text-xl font-semibold mb-4">Project Timeline: {activeProposal.title}</h2>
//           <div className="space-y-4">
            
//             {/* TIMELINE STEP 1: ONE-PAGER */}
//             <TimelineStep
//               title="Step 1: One-Pager"
//               status={activeProposal.status === "pending_onepager" ? "pending" : activeProposal.status === "rejected" ? "rejected" : "complete"}
//               fileUrl={activeProposal.onePagerPath}
//               date={activeProposal.createdAt}
//             >
//               {activeProposal.status === "rejected" && <p className="text-red-600 text-sm">Your proposal was rejected. You may need to submit a new proposal.</p>}
//             </TimelineStep>

//             {/* TIMELINE STEP 2: FULL PROPOSAL */}
//             <TimelineStep
//               title="Step 2: Full Proposal"
//               status={
//                 activeProposal.status === "pending_onepager"
//                   ? "waiting"
//                   : activeProposal.status === "pending_proposal"
//                   ? "ready"
//                   : activeProposal.status === "pending_final_approval"
//                   ? "pending"
//                   : activeProposal.status === "rejected"
//                   ? "rejected"
//                   : "complete"
//               }
//               fileUrl={activeProposal.proposalFilePath}
//               date={activeProposal.proposalFilePath ? activeProposal.updatedAt : null}
//             >
//               {currentStep === "Step 2: Submit Full Proposal" && (
//                 <button onClick={() => setIsProposalModalOpen(true)} className="mt-2 bg-blue-600 text-white px-3 py-1 rounded shadow hover:bg-blue-700 text-sm font-medium">
//                   Submit Full Proposal
//                 </button>
//               )}
//             </TimelineStep>

//             {/* TIMELINE STEP 3: FINAL DOCUMENTATION */}
//             <TimelineStep
//               title="Step 3: Final Documentation"
//               status={!dashboardData.project ? "waiting" : dashboardData.project.documentationPath ? "complete" : "ready"}
//               fileUrl={dashboardData.project?.documentationPath}
//               date={dashboardData.project?.documentationPath ? dashboardData.project.updatedAt : null}
//             >
//               {currentStep === "Step 3: Submit Final Documentation" && (
//                 <button onClick={() => setIsDocModalOpen(true)} className="mt-2 bg-blue-600 text-white px-3 py-1 rounded shadow hover:bg-blue-700 text-sm font-medium">
//                   Submit Final Documentation
//                 </button>
//               )}
//               {currentStep === "Step 4: Project Complete" && <p className="text-sm text-green-700">Your final documentation has been submitted.</p>}
//             </TimelineStep>
//           </div>
//         </div>
//       )}

//       {/* --- PROPOSAL HISTORY TABLE --- */}
//       <div className="bg-white p-6 shadow rounded-lg">
//         <h2 className="text-xl font-semibold mb-4">My Proposal History</h2>
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className="bg-gray-50">
//                 <th className="px-4 py-2 text-left text-sm font-medium">Title</th>
//                 <th className="px-4 py-2 text-left text-sm font-medium">Supervisor</th>
//                 <th className="px-4 py-2 text-left text-sm font-medium">Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {myProposals.length === 0 ? (
//                 <tr>
//                   <td colSpan="3" className="p-4 text-center text-gray-500">
//                     You have not submitted any proposals.
//                   </td>
//                 </tr>
//               ) : (
//                 myProposals.map((prop) => (
//                   <tr key={prop._id} className="border-b">
//                     <td className="px-4 py-2">{prop.title}</td>
//                     <td className="px-4 py-2">{prop.supervisor?.name || "N/A"}</td>
//                     <td className="px-4 py-2">
//                       <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusClass(prop.status)}`}>
//                         {prop.status === "pending_onepager" && "One-Pager Pending"}
//                         {prop.status === "pending_proposal" && "One-Pager Approved"}
//                         {prop.status === "pending_final_approval" && "Proposal Pending"}
//                         {prop.status === "approved" && "Project Approved"}
//                         {prop.status === "rejected" && "Rejected"}
//                       </span>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* ===================== */}
//       {/* MODAL 1: CREATE GROUP */}
//       {/* ===================== */}
//       {isModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
//             <h2 className="text-xl font-bold mb-4">Create Group & Propose Project (Step 1)</h2>
//             <form onSubmit={handleOnePagerSubmit}>
//               <div className="space-y-4">
//                 <div className="border-b pb-4">
//                   <h3 className="text-lg font-medium text-gray-900">Group Details</h3>
//                   <p className="text-sm text-gray-500">Create your group. You will be the group leader.</p>
//                   <input
//                     type="text"
//                     name="groupName"
//                     placeholder="Group Name (e.g., 'G1' or 'Innovators')"
//                     value={newProposal.groupName}
//                     onChange={handleModalChange}
//                     className="w-full p-2 border rounded mt-2"
//                     required
//                   />
//                   <input
//                     type="text"
//                     name="memberRollNumbers"
//                     placeholder="Other Member Roll Numbers (comma-separated)"
//                     value={newProposal.memberRollNumbers}
//                     onChange={handleModalChange}
//                     className="w-full p-2 border rounded mt-2"
//                   />
//                 </div>

//                 <div className="pt-4">
//                   <h3 className="text-lg font-medium text-gray-900">Project Details</h3>
//                   <input
//                     type="text"
//                     name="title"
//                     placeholder="Project Title"
//                     value={newProposal.title}
//                     onChange={handleModalChange}
//                     className="w-full p-2 border rounded mt-2"
//                     required
//                   />
//                   <textarea
//                     name="description"
//                     placeholder="Project Description (Optional)"
//                     value={newProposal.description}
//                     onChange={handleModalChange}
//                     className="w-full p-2 border rounded mt-2"
//                     rows="3"
//                   />
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">Upload One-Pager (PDF Required)</label>
//                     <input
//                       type="file"
//                       name="onePager"
//                       accept=".pdf"
//                       onChange={(e) => setOnePagerFile(e.target.files?.[0] || null)}
//                       className="w-full p-2 border rounded file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#a96a3f] file:text-white hover:file:opacity-90"
//                       required
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div className="flex justify-end gap-3 mt-6">
//                 <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-400 text-white px-4 py-2 rounded" disabled={isSubmitting}>
//                   Cancel
//                 </button>
//                 <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded" disabled={isSubmitting}>
//                   {isSubmitting ? "Submitting..." : "Create Group & Submit"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* ===================== */}
//       {/* MODAL 2: FULL PROPOSAL */}
//       {/* ===================== */}
//       {isProposalModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
//             <h2 className="text-xl font-bold mb-4">Submit Full Proposal (Step 2)</h2>
//             <form onSubmit={handleFullProposalSubmit}>
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Upload Full Proposal (PDF/DOCX)</label>
//                   <input
//                     type="file"
//                     name="proposalFile"
//                     accept=".pdf,.doc,.docx"
//                     onChange={(e) => setProposalFile(e.target.files?.[0] || null)}
//                     className="w-full p-2 border rounded file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#a96a3f] file:text-white hover:file:opacity-90"
//                     required
//                   />
//                 </div>
//               </div>
//               <div className="flex justify-end gap-3 mt-6">
//                 <button type="button" onClick={() => setIsProposalModalOpen(false)} className="bg-gray-400 text-white px-4 py-2 rounded" disabled={isSubmittingProposal}>
//                   Cancel
//                 </button>
//                 <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded" disabled={isSubmittingProposal}>
//                   {isSubmittingProposal ? "Submitting..." : "Submit Proposal"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* ===================== */}
//       {/* MODAL 3: FINAL DOCS */}
//       {/* ===================== */}
//       {isDocModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
//             <h2 className="text-xl font-bold mb-4">Submit Final Deliverables</h2>
//             <form onSubmit={handleDocSubmit}>
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Project Link (GitHub, Vercel, etc.)</label>
//                   <input type="text" name="projectLink" placeholder="https://github.com/..." value={projectLink} onChange={(e) => setProjectLink(e.target.value)} className="w-full p-2 border rounded" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Final Documentation (PDF/DOCX)</label>
//                   <input
//                     type="file"
//                     name="documentation"
//                     accept=".pdf,.doc,.docx"
//                     onChange={(e) => setDocFile(e.target.files?.[0] || null)}
//                     className="w-full p-2 border rounded file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#a96a3f] file:text-white hover:file:opacity-90"
//                     required
//                   />
//                 </div>
//               </div>
//               <div className="flex justify-end gap-3 mt-6">
//                 <button type="button" onClick={() => setIsDocModalOpen(false)} className="bg-gray-400 text-white px-4 py-2 rounded" disabled={isSubmittingDocs}>
//                   Cancel
//                 </button>
//                 <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded" disabled={isSubmittingDocs}>
//                   {isSubmittingDocs ? "Submitting..." : "Submit Project"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default StudentDashboard;



// new without goup name

import { useEffect, useState, useMemo } from "react";
import { ApiCall } from "../../api/apiCall";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000";

// ===================================
// TimelineStep Helper Component
// ===================================
function TimelineStep({ title, status, fileUrl, date, children }) {
  let statusColor = "text-gray-500";
  let statusText = "Not Started";

  switch (status) {
    case "pending":
      statusColor = "text-yellow-600";
      statusText = "Pending Review";
      break;
    case "rejected":
      statusColor = "text-red-600";
      statusText = "Rejected";
      break;
    case "waiting":
      statusColor = "text-gray-500";
      statusText = "Waiting";
      break;
    case "ready":
      statusColor = "text-blue-600";
      statusText = "Ready to Submit";
      break;
    case "complete":
      statusColor = "text-green-600";
      statusText = "Completed";
      break;
    default:
      statusColor = "text-gray-500";
      statusText = "Not Started";
  }

  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return null;
    }
  };

  const formattedDate = formatDate(date);

  return (
    <div className="bg-white p-4 rounded-lg shadow border">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className={`font-semibold text-sm ${statusColor}`}>{statusText}</span>
      </div>

      {formattedDate && (status === "complete" || status === "pending") && (
        <p className="text-xs text-gray-500">Submitted: {formattedDate}</p>
      )}

      {fileUrl && (
        <a
          href={`${API_URL}/${fileUrl.replace(/\\/g, "/")}`}
          target="_blank"
          rel="noopener noreferrer"
          download
          className="text-sm text-blue-600 hover:underline"
        >
          View Submitted File
        </a>
      )}

      <div className="mt-3">{children}</div>
    </div>
  );
}

// ===================================
// Student Dashboard Main Component
// ===================================
function StudentDashboard() {
  // Data State
  const [dashboardData, setDashboardData] = useState({});
  const [myProposals, setMyProposals] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshToggle, setRefreshToggle] = useState(false);

  const token = JSON.parse(localStorage.getItem("userInfo"))?.token || null;

  // --- MODAL STATES ---

  // 1. Create Group & One-Pager Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  // UPDATED: Removed 'groupName' from state
  const [newProposal, setNewProposal] = useState({
    title: "",
    description: "",
    memberRollNumbers: "",
  });
  const [onePagerFile, setOnePagerFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. Submit Full Proposal Modal
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [proposalFile, setProposalFile] = useState(null);
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);

  // 3. Submit Final Documentation Modal
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [projectLink, setProjectLink] = useState("");
  const [docFile, setDocFile] = useState(null);
  const [isSubmittingDocs, setIsSubmittingDocs] = useState(false);

  // ===================================
  // Fetch Data
  // ===================================
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [dataRes, proposalsRes, teachersRes] = await Promise.all([
          ApiCall({ route: "student/dashboard-data", verb: "get", token }),
          ApiCall({ route: "proposals/my-proposals", verb: "get", token }),
          ApiCall({ route: "teachers", verb: "get", token }),
        ]);

        setDashboardData(dataRes || {});
        setMyProposals(Array.isArray(proposalsRes) ? proposalsRes : []);
        setTeachers(Array.isArray(teachersRes) ? teachersRes : []);
      } catch (err) {
        toast.error("Failed to fetch dashboard data: " + (err?.message || err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshToggle, token]);

  // Helper for input changes
  const handleModalChange = (e) => {
    setNewProposal({ ...newProposal, [e.target.name]: e.target.value });
  };

  // ===================================
  // Handlers
  // ===================================

  // 1. Submit One-Pager (Creates Group AUTOMATICALLY)
  const handleOnePagerSubmit = async (e) => {
    e.preventDefault();
    // UPDATED: Check removed for groupName
    if (!newProposal.title || !onePagerFile) {
      toast.error("Please provide a Title and a One-Pager PDF.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("title", newProposal.title);
    formData.append("description", newProposal.description || "N/A");
    formData.append("onePager", onePagerFile);
    // UPDATED: Removed appending groupName manually
    formData.append("memberRollNumbers", newProposal.memberRollNumbers);

    try {
      const res = await fetch(`${API_URL}/api/proposals`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Submission failed");

      toast.success("Group Created (Name Auto-assigned) and One-Pager Submitted!");
      setIsModalOpen(false);
      // UPDATED: Reset state
      setNewProposal({ title: "", description: "", memberRollNumbers: "" });
      setOnePagerFile(null);
      setRefreshToggle((s) => !s);
    } catch (err) {
      toast.error(err?.message || "Failed to submit One-Pager");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Submit Full Proposal
  const handleFullProposalSubmit = async (e) => {
    e.preventDefault();
    if (!proposalFile) {
      toast.error("Please upload your Full Proposal file.");
      return;
    }

    const activeProposal = myProposals.find((p) => p.status === "pending_proposal");
    if (!activeProposal) {
      toast.error("Could not find active proposal to update.");
      return;
    }

    setIsSubmittingProposal(true);
    const formData = new FormData();
    formData.append("proposalFile", proposalFile);

    try {
      const res = await fetch(`${API_URL}/api/proposals/${activeProposal._id}/submit-proposal`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Submission failed");

      toast.success("Full Proposal submitted successfully!");
      setIsProposalModalOpen(false);
      setProposalFile(null);
      setRefreshToggle((s) => !s);
    } catch (err) {
      toast.error(err?.message || "Failed to submit proposal");
    } finally {
      setIsSubmittingProposal(false);
    }
  };

  // 3. Submit Final Documentation
  const handleDocSubmit = async (e) => {
    e.preventDefault();
    if (!docFile) {
      toast.error("Please upload your final documentation file.");
      return;
    }

    setIsSubmittingDocs(true);
    const formData = new FormData();
    formData.append("documentation", docFile);
    formData.append("projectLink", projectLink || "");

    try {
      const res = await fetch(`${API_URL}/api/projects/submit-documentation`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Submission failed");

      toast.success("Final documentation submitted successfully!");
      setIsDocModalOpen(false);
      setDocFile(null);
      setProjectLink("");
      setRefreshToggle((s) => !s);
    } catch (err) {
      toast.error(err?.message || "Failed to submit documentation");
    } finally {
      setIsSubmittingDocs(false);
    }
  };

  // ===================================
  // Helpers for UI Logic
  // ===================================
  const getStatusClass = (status) => {
    if (status === "approved") return "text-green-600 bg-green-100";
    if (status === "rejected") return "text-red-600 bg-red-100";
    if (status === "pending_proposal") return "text-blue-600 bg-blue-100";
    if (status === "pending_final_approval") return "text-purple-600 bg-purple-100";
    if (status === "pending_onepager") return "text-yellow-600 bg-yellow-100";
    return "text-gray-600 bg-gray-100";
  };

  const getCurrentStep = () => {
    const { project } = dashboardData || {};

    if (project && project.documentationPath) return "Step 4: Project Complete";
    if (project) return "Step 3: Submit Final Documentation";

    const proposalPendingFinal = myProposals.some((p) => p.status === "pending_final_approval");
    const onePagerApproved = myProposals.some((p) => p.status === "pending_proposal");
    const onePagerPending = myProposals.some((p) => p.status === "pending_onepager");

    if (proposalPendingFinal) return "Step 2: Proposal Pending";
    if (onePagerApproved) return "Step 2: Submit Full Proposal";
    if (onePagerPending) return "Step 1: One-Pager Pending";

    return "Step 1: Get a Project";
  };

  const currentStep = !loading ? getCurrentStep() : "";

  // Merge Project Data with Proposal Data for the Timeline
  const activeProposal = useMemo(() => {
    if (dashboardData?.project) {
      const originalProposal = myProposals.find((p) => p.status === "approved");
      return { ...(dashboardData.project || {}), ...(originalProposal || {}), status: "approved" };
    }
    return myProposals.find((p) => p.status !== "rejected");
  }, [dashboardData?.project, myProposals]);

  if (loading) return <p className="text-center mt-10">Loading dashboard...</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Student Dashboard</h1>
        {/* Only show propose button if they are on Step 1 */}
        {currentStep === "Step 1: Get a Project" && (
          <button onClick={() => setIsModalOpen(true)} className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700">
            Create Group & Propose Project
          </button>
        )}
      </div>

      {/* --- Main Info Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        
        {/* 1. PROJECT STATUS CARD */}
        <div className="bg-white p-6 shadow rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Project Status</h2>

          {/* Step 1: No Project */}
          {currentStep === "Step 1: Get a Project" && (
            <div className="text-center p-4 bg-gray-50 rounded">
              <h3 className="font-semibold text-lg text-gray-800">Step 1: Get a Project</h3>
              <p className="text-gray-600 mt-2">You are not assigned to a project yet. You can either propose a new idea or apply for an existing one.</p>
              <Link to="/projects" className="inline-block mt-4 text-[#a96a3f] font-medium hover:underline">
                Browse available projects
              </Link>
            </div>
          )}

          {/* Step 1: One-Pager Pending */}
          {currentStep === "Step 1: One-Pager Pending" && (
            <div className="text-center p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
              <h3 className="font-semibold text-lg text-yellow-800">Step 1: One-Pager Pending</h3>
              <p className="text-yellow-700 mt-2">Your group's One-Pager is under review by the admin. Please check the "Project Timeline" below for details.</p>
            </div>
          )}

          {/* Step 2: Submit Full Proposal */}
          {currentStep === "Step 2: Submit Full Proposal" && (
            <div className="p-3 bg-blue-100 border border-blue-300 rounded-lg">
              <h4 className="font-semibold text-blue-800">Step 2: Submit Full Proposal</h4>
              <p className="text-sm text-blue-700">Your One-Pager was approved! Please submit your full, detailed proposal for final review.</p>
              <button onClick={() => setIsProposalModalOpen(true)} className="mt-2 bg-blue-600 text-white px-3 py-1 rounded shadow hover:bg-blue-700 text-sm font-medium">
                Submit Full Proposal
              </button>
            </div>
          )}

          {/* Step 2: Proposal Pending */}
          {currentStep === "Step 2: Proposal Pending" && (
            <div className="text-center p-4 bg-purple-100 border border-purple-300 rounded-lg">
              <h3 className="font-semibold text-lg text-purple-800">Step 2: Proposal Pending</h3>
              <p className="text-purple-700 mt-2">Your group's Full Proposal is under final review. Please check the "Project Timeline" below for details.</p>
            </div>
          )}

          {/* Step 3: Project in Progress */}
          {currentStep === "Step 3: Submit Final Documentation" && dashboardData.project && (
            <div>
              <h3 className="text-lg font-bold text-[#a96a3f]">{dashboardData.project.title}</h3>
              <p className="text-gray-700 mt-2">{dashboardData.project.description}</p>
              <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                <h4 className="font-semibold text-yellow-800">Step 3: Submit Final Documentation</h4>
                <p className="text-sm text-yellow-700">Your project is in progress. Please submit your final documentation when ready.</p>
                <button onClick={() => setIsDocModalOpen(true)} className="mt-2 bg-yellow-600 text-white px-3 py-1 rounded shadow hover:bg-yellow-700 text-sm font-medium">
                  Submit Final Documentation
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Project Complete */}
          {currentStep === "Step 4: Project Complete" && dashboardData.project && (
            <div>
              <h3 className="text-lg font-bold text-[#a96a3f]">{dashboardData.project.title}</h3>
              <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg">
                <h4 className="font-semibold text-green-800">Step 4: Project Completed!</h4>
                <p className="text-sm text-green-700">You have submitted your final documentation.</p>
                <div className="flex gap-4 mt-2">
                  {dashboardData.project?.documentationPath && (
                    <a
                      href={`${API_URL}/${dashboardData.project.documentationPath.replace(/\\/g, "/")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="text-blue-600 hover:underline font-medium text-sm"
                    >
                      View Your Submission
                    </a>
                  )}
                  {dashboardData.project?.projectLink && (
                    <a
                      href={dashboardData.project.projectLink.startsWith("http") ? dashboardData.project.projectLink : `http://${dashboardData.project.projectLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-medium text-sm"
                    >
                      View Project Link
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. GROUP & DETAILS CARD */}
        <div className="bg-white p-6 shadow rounded-lg">
          <h2 className="text-xl font-semibold mb-4">My Details</h2>
          <div className="space-y-3">
            <p>
              <strong>Supervisor:</strong> {dashboardData.student?.supervisor?.name || "Not Assigned"}
            </p>
            <p>
              <strong>Group:</strong> <span className="font-semibold">{dashboardData.student?.group || "Not Assigned"}</span>
            </p>

            {dashboardData.student?.group && (
              <div className="pt-2">
                <h3 className="font-semibold text-gray-800">Group Members:</h3>
                <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
                  {dashboardData.student && (
                    <li>
                      {dashboardData.student.name} ({dashboardData.student.rollNumber}) (You)
                    </li>
                  )}
                  {(dashboardData.groupMembers || []).map((member) => (
                    <li key={member._id}>
                      {member.name} ({member.rollNumber})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- PROJECT TIMELINE --- */}
      {activeProposal && (
        <div className="bg-white p-6 shadow rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Project Timeline: {activeProposal.title}</h2>
          <div className="space-y-4">
            
            {/* TIMELINE STEP 1: ONE-PAGER */}
            <TimelineStep
              title="Step 1: One-Pager"
              status={activeProposal.status === "pending_onepager" ? "pending" : activeProposal.status === "rejected" ? "rejected" : "complete"}
              fileUrl={activeProposal.onePagerPath}
              date={activeProposal.createdAt}
            >
              {activeProposal.status === "rejected" && <p className="text-red-600 text-sm">Your proposal was rejected. You may need to submit a new proposal.</p>}
            </TimelineStep>

            {/* TIMELINE STEP 2: FULL PROPOSAL */}
            <TimelineStep
              title="Step 2: Full Proposal"
              status={
                activeProposal.status === "pending_onepager"
                  ? "waiting"
                  : activeProposal.status === "pending_proposal"
                  ? "ready"
                  : activeProposal.status === "pending_final_approval"
                  ? "pending"
                  : activeProposal.status === "rejected"
                  ? "rejected"
                  : "complete"
              }
              fileUrl={activeProposal.proposalFilePath}
              date={activeProposal.proposalFilePath ? activeProposal.updatedAt : null}
            >
              {currentStep === "Step 2: Submit Full Proposal" && (
                <button onClick={() => setIsProposalModalOpen(true)} className="mt-2 bg-blue-600 text-white px-3 py-1 rounded shadow hover:bg-blue-700 text-sm font-medium">
                  Submit Full Proposal
                </button>
              )}
            </TimelineStep>

            {/* TIMELINE STEP 3: FINAL DOCUMENTATION */}
            <TimelineStep
              title="Step 3: Final Documentation"
              status={!dashboardData.project ? "waiting" : dashboardData.project.documentationPath ? "complete" : "ready"}
              fileUrl={dashboardData.project?.documentationPath}
              date={dashboardData.project?.documentationPath ? dashboardData.project.updatedAt : null}
            >
              {currentStep === "Step 3: Submit Final Documentation" && (
                <button onClick={() => setIsDocModalOpen(true)} className="mt-2 bg-blue-600 text-white px-3 py-1 rounded shadow hover:bg-blue-700 text-sm font-medium">
                  Submit Final Documentation
                </button>
              )}
              {currentStep === "Step 4: Project Complete" && <p className="text-sm text-green-700">Your final documentation has been submitted.</p>}
            </TimelineStep>
          </div>
        </div>
      )}

      {/* --- PROPOSAL HISTORY TABLE --- */}
      <div className="bg-white p-6 shadow rounded-lg">
        <h2 className="text-xl font-semibold mb-4">My Proposal History</h2>
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
                <tr>
                  <td colSpan="3" className="p-4 text-center text-gray-500">
                    You have not submitted any proposals.
                  </td>
                </tr>
              ) : (
                myProposals.map((prop) => (
                  <tr key={prop._id} className="border-b">
                    <td className="px-4 py-2">{prop.title}</td>
                    <td className="px-4 py-2">{prop.supervisor?.name || "N/A"}</td>
                    <td className="px-4 py-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusClass(prop.status)}`}>
                        {prop.status === "pending_onepager" && "One-Pager Pending"}
                        {prop.status === "pending_proposal" && "One-Pager Approved"}
                        {prop.status === "pending_final_approval" && "Proposal Pending"}
                        {prop.status === "approved" && "Project Approved"}
                        {prop.status === "rejected" && "Rejected"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================== */}
      {/* MODAL 1: CREATE GROUP */}
      {/* ===================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Create Group & Propose Project (Step 1)</h2>
            <form onSubmit={handleOnePagerSubmit}>
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="text-lg font-medium text-gray-900">Group Details</h3>
                  <p className="text-sm text-gray-500">
                    We will automatically assign your Group Name based on your department (e.g., BSIT-G-1).
                  </p>
                  
                  {/* REMOVED GROUP NAME INPUT */}

                  <input
                    type="text"
                    name="memberRollNumbers"
                    placeholder="Other Member Roll Numbers (comma-separated)"
                    value={newProposal.memberRollNumbers}
                    onChange={handleModalChange}
                    className="w-full p-2 border rounded mt-2"
                  />
                </div>

                <div className="pt-4">
                  <h3 className="text-lg font-medium text-gray-900">Project Details</h3>
                  <input
                    type="text"
                    name="title"
                    placeholder="Project Title"
                    value={newProposal.title}
                    onChange={handleModalChange}
                    className="w-full p-2 border rounded mt-2"
                    required
                  />
                  <textarea
                    name="description"
                    placeholder="Project Description (Optional)"
                    value={newProposal.description}
                    onChange={handleModalChange}
                    className="w-full p-2 border rounded mt-2"
                    rows="3"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">Upload One-Pager (PDF Required)</label>
                    <input
                      type="file"
                      name="onePager"
                      accept=".pdf"
                      onChange={(e) => setOnePagerFile(e.target.files?.[0] || null)}
                      className="w-full p-2 border rounded file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#a96a3f] file:text-white hover:file:opacity-90"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-400 text-white px-4 py-2 rounded" disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Create Group & Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== */}
      {/* MODAL 2: FULL PROPOSAL */}
      {/* ===================== */}
      {isProposalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Submit Full Proposal (Step 2)</h2>
            <form onSubmit={handleFullProposalSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Full Proposal (PDF/DOCX)</label>
                  <input
                    type="file"
                    name="proposalFile"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setProposalFile(e.target.files?.[0] || null)}
                    className="w-full p-2 border rounded file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#a96a3f] file:text-white hover:file:opacity-90"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsProposalModalOpen(false)} className="bg-gray-400 text-white px-4 py-2 rounded" disabled={isSubmittingProposal}>
                  Cancel
                </button>
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded" disabled={isSubmittingProposal}>
                  {isSubmittingProposal ? "Submitting..." : "Submit Proposal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== */}
      {/* MODAL 3: FINAL DOCS */}
      {/* ===================== */}
      {isDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Submit Final Deliverables</h2>
            <form onSubmit={handleDocSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Link (GitHub, Vercel, etc.)</label>
                  <input type="text" name="projectLink" placeholder="https://github.com/..." value={projectLink} onChange={(e) => setProjectLink(e.target.value)} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Final Documentation (PDF/DOCX)</label>
                  <input
                    type="file"
                    name="documentation"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                    className="w-full p-2 border rounded file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#a96a3f] file:text-white hover:file:opacity-90"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsDocModalOpen(false)} className="bg-gray-400 text-white px-4 py-2 rounded" disabled={isSubmittingDocs}>
                  Cancel
                </button>
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded" disabled={isSubmittingDocs}>
                  {isSubmittingDocs ? "Submitting..." : "Submit Project"}
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