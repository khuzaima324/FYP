// import React, { useEffect, useState, useMemo } from "react";
// import { ApiCall } from "../../api/apiCall";
// import { toast } from "react-toastify";
// import { Link } from "react-router-dom";

// // We need the API_URL for FormData fetch
// const API_URL = "http://localhost:5000"; 

// function ViewProjects() {
//   const [availableProjects, setAvailableProjects] = useState([]);
//   const [pastProjects, setPastProjects] = useState([]); // For AI context
//   const [myProject, setMyProject] = useState(null);
//   const [teachers, setTeachers] = useState([]);
//   const [myProposals, setMyProposals] = useState([]); // For checking "Applied" status
//   const [loading, setLoading] = useState(true);
//   const [refresh, setRefresh] = useState(false);

//   // States for the application modal
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedProject, setSelectedProject] = useState(null);
//   const [onePagerFile, setOnePagerFile] = useState(null);
//   const [pitchDescription, setPitchDescription] = useState("");
//   const [supervisorId, setSupervisorId] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // State for AI Suggestion Bot
//   const [isAiModalOpen, setIsAiModalOpen] = useState(false);
//   const [aiQuery, setAiQuery] = useState("");
//   const [aiIdeas, setAiIdeas] = useState([]);
//   const [isAiLoading, setIsAiLoading] = useState(false);


//   const token = JSON.parse(localStorage.getItem("userInfo"))?.token || null;

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         // Fetch all data in parallel
//         const [studentData, projectsData, teachersData, pastProjectsData, proposalsData] = await Promise.all([
//           ApiCall({ route: "student/dashboard-data", verb: "get", token: token }),
//           ApiCall({ route: "projects/available", verb: "get", token: token }),
//           ApiCall({ route: "teachers", verb: "get", token: token }),
//           ApiCall({ route: "past-projects", verb: "get", token: token }), // For AI context
//           ApiCall({ route: "proposals/my-proposals", verb: "get", token: token }), // For "Applied" tag
//         ]);

//         if (studentData.project) {
//           setMyProject(studentData.project);
//         }
//         setAvailableProjects(Array.isArray(projectsData) ? projectsData : []);
//         setTeachers(Array.isArray(teachersData) ? teachersData : []);
//         setPastProjects(Array.isArray(pastProjectsData) ? pastProjectsData : []);
//         setMyProposals(Array.isArray(proposalsData) ? proposalsData : []);
//       } catch (err) {
//         toast.error(err?.message || "Failed to fetch project data");
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     if (token) {
//       fetchData();
//     } else {
//       setLoading(false);
//       toast.error("Not logged in");
//     }
//   }, [token, refresh]);

//   // ===================================
//   // ✅ 1. BUG FIX: 'myProposals' added to dependency array
//   // ===================================
//   const pendingApplicationIds = useMemo(() => {
//     return new Set(
//       myProposals
//         .filter(p => p.originProject && p.status === 'pending_onepager') // Check for the initial pending status
//         .map(p => p.originProject._id)
//     );
//   }, [myProposals]);

//   // --- Application Modal Handlers ---
//   const openApplicationModal = (project) => {
//     setSelectedProject(project);
//     // If project already has a supervisor, pre-fill it
//     if (project.supervisor?._id) {
//       setSupervisorId(project.supervisor._id);
//     }
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setSelectedProject(null);
//     setOnePagerFile(null);
//     setPitchDescription("");
//     setSupervisorId("");
//   };

//   // ===================================
//   // ✅ 2. BUG FIX: Logic now correctly handles projects with no supervisor
//   // ===================================
//   const handleApplicationSubmit = async (e) => {
//     e.preventDefault();
//     if (!onePagerFile) {
//       toast.error("A One-Pager (PDF) is required to apply.");
//       return;
//     }
//     // If supervisor wasn't pre-filled (admin project), student must choose
//     // if (!supervisorId ) {
//     //   toast.error("You must select a supervisor to apply.");
//     //   return;
//     // }

//     setIsSubmitting(true);

//     const formData = new FormData();
//     formData.append("title", selectedProject.title);
//     // formData.append("supervisor", supervisorId); // Send the selected supervisor
//     formData.append("originProject", selectedProject._id);
//     formData.append("onePager", onePagerFile);
//     formData.append("description", pitchDescription || `Application for ${selectedProject.title}`);

//     try {
//       const res = await fetch(`${API_URL}/api/proposals`, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}` },
//         body: formData,
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message);

//       toast.success("Application submitted successfully!");
//       closeModal();
//       setRefresh(!refresh);
//     } catch (err) {
//       toast.error(err.message || "Failed to submit application");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // --- AI Bot Modal Handlers ---
//   const handleGenerateIdeas = async (e) => {
//     e.preventDefault();
//     if (!aiQuery) {
//       toast.error("Please enter your interests.");
//       return;
//     }
    
//     setIsAiLoading(true);
//     setAiIdeas([]);

//     // 1. Get past project titles for context
//     const pastTitles = pastProjects
//       .map(p => p.title)
//       .sort(() => 0.5 - Math.random()) // Shuffle
//       .slice(0, 10) // Get 10 random titles
//       .join(", ");

//     // 2. Define the System Prompt
//     const systemPrompt = "You are a helpful Computer Science professor. Your goal is to suggest 5 innovative Final Year Project (FYP) ideas for a university student. You must return your answer *only* as a valid JSON array of objects, with each object having a 'title' and 'description' key.";

//     // 3. Define the User Query
//     const userQuery = `My interests are: "${aiQuery}".
// Based on my interests and the context of these past projects from my university (${pastTitles}), please generate 5 new project ideas.`;

//     // 4. Define the JSON Schema for the response
//     const jsonSchema = {
//       type: "ARRAY",
//       items: {
//         type: "OBJECT",
//         properties: {
//           "title": { "type": "STRING" },
//           "description": { "type": "STRING" }
//         },
//         required: ["title", "description"]
//       }
//     };
    
//     // 5. Construct the API Payload
//     const payload = {
//       contents: [{ parts: [{ text: userQuery }] }],
//       systemInstruction: {
//         parts: [{ text: systemPrompt }]
//       },
//       generationConfig: {
//         responseMimeType: "application/json",
//         responseSchema: jsonSchema,
//       },
//       tools: [{ "google_search": {} }] 
//     };

//     const apiKey = ""; // API key is handled by Canvas
//     const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

//     try {
//       const response = await fetch(apiUrl, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload)
//       });

//       if (!response.ok) {
//         throw new Error("Failed to get ideas from AI. Please try again.");
//       }
      
//       const result = await response.json();
//       const text = result.candidates[0].content.parts[0].text;
//       const ideas = JSON.parse(text);
//       setAiIdeas(ideas);

//     } catch (err) {
//       console.error("AI Error:", err);
//       toast.error(err.message);
//       setAiIdeas([]);
//     } finally {
//       setIsAiLoading(false);
//     }
//   };


//   if (loading) return <p className="text-center mt-10">Loading projects...</p>;

//   // --- 1. If Student ALREADY has a project ---
//   if (myProject) {
//     return (
//       <div className="max-w-2xl mx-auto text-center bg-white p-8 shadow-lg rounded-lg">
//         <h2 className="text-2xl font-bold mb-4">You Have a Project!</h2>
//         <p className="text-gray-700 mb-2">You are already assigned to the following project:</p>
//         <h3 className="text-xl font-semibold text-[#a96a3f]">{myProject.title}</h3>
//         {myProject.supervisor && (
//           <p className="text-gray-600 mt-1">
//             Supervisor: {myProject.supervisor.name}
//           </p>
//         )}
//         <Link 
//           to="/student-dashboard" 
//           className="inline-block mt-6 bg-[#a96a3f] text-white px-4 py-2 rounded hover:opacity-90"
//         >
//           Back to Dashboard
//         </Link>
//       </div>
//     );
//   }

//   // --- 2. If Student has NO project ---
//   return (
//     <div className="p-6">
//       <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
//         <h1 className="text-2xl font-bold">Available Projects</h1>
//         {/* --- AI SUGGESTION BUTTON --- */}
//         <button
//           onClick={() => setIsAiModalOpen(true)}
//           className="bg-purple-600 text-white px-4 py-2 rounded shadow-lg hover:bg-purple-700 flex items-center gap-2"
//         >
//           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
//             <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12L17 14.188l-1.25-2.188L13.5 11l2.188-1.25L17 7.5l1.25 2.188L20.5 11l-2.188 1.25z" />
//           </svg>
//           Get AI Project Suggestions
//         </button>
//       </div>
      
//       {availableProjects.length === 0 ? (
//         <p className="text-center text-gray-600">
//           No available projects at this time. You can propose your own on your dashboard.
//         </p>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {/* --- Project Card Mapping --- */}
//           {availableProjects.map((project) => {
//             const hasApplied = pendingApplicationIds.has(project._id);
//             const isAdminSuggested = project.origin === 'admin';

//             return (
//               <div 
//                 key={project._id} 
//                 className="bg-white shadow-lg rounded-lg p-5 flex flex-col justify-between relative"
//               >
//                 {/* --- TAGS --- */}
//                 {isAdminSuggested && (
//                   <span className="absolute top-2 right-2 text-xs font-semibold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
//                     Admin Suggested
//                   </span>
//                 )}
//                 {hasApplied && (
//                   <span className="absolute top-2 left-2 text-xs font-semibold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
//                     Application Pending
//                   </span>
//                 )}
//                 {/* --- END TAGS --- */}
                
//                 <div>
//                   <h3 className="text-lg font-bold text-[#a96a3f] pt-5">{project.title}</h3>
//                   <p className="text-sm font-medium text-gray-600 my-2">
//                     Supervisor: {project.supervisor?.name || "Not yet assigned"}
//                   </p>
//                   <p className="text-gray-700 text-sm mt-2">{project.description}</p>
//                 </div>
                
//                 <button
//                   onClick={() => openApplicationModal(project)}
//                   className={`mt-4 text-white w-full py-2 rounded font-semibold ${
//                     hasApplied 
//                     ? 'bg-gray-400 cursor-not-allowed' 
//                     : 'bg-green-600 hover:bg-green-700'
//                   }`}
//                   disabled={hasApplied}
//                 >
//                   {hasApplied ? "Applied" : "Apply for this Project"}
//                 </button>
//               </div>
//             );
//           })}
//         </div>
//       )}
      
//       {/* --- Application Modal --- */}
//       {isModalOpen && selectedProject && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
//             <h2 className="text-xl font-bold mb-2">Apply for Project</h2>
//             <h3 className="text-lg mb-4 font-semibold text-[#a96a3f]">{selectedProject.title}</h3>
            
//             <form onSubmit={handleApplicationSubmit}>
//               <div className="space-y-4">

//                 {/* --- Conditional Supervisor Dropdown --- */}
//                 {selectedProject.supervisor ? (
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700">Supervisor (Pre-assigned)</label>
//                     <input
//                       type="text"
//                       value={selectedProject.supervisor.name}
//                       disabled
//                       className="w-full p-2 border rounded bg-gray-100"
//                     />
//                   </div>
//                 ) : (
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700">
//                       Select a Supervisor (Required)
//                     </label>
//                     <select
//                       name="supervisor"
//                       value={supervisorId}
//                       onChange={(e) => setSupervisorId(e.target.value)}
//                       className="w-full p-2 border rounded"
//                     >
//                       <option value="">Choose a supervisor for this project</option>
//                       {teachers.map(teacher => (
//                         <option key={teacher._id} value={teacher._id}>
//                           {teacher.name}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 )}
//                 {/* --- End of Conditional Logic --- */}

//                 <textarea
//                   name="description"
//                   placeholder="Add a short description or pitch (Optional)"
//                   value={pitchDescription}
//                   onChange={(e) => setPitchDescription(e.target.value)}
//                   className="w-full p-2 border rounded"
//                   rows="3"
//                 />
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Upload One-Pager (PDF Required)
//                   </label>
//                   <input
//                     type="file"
//                     name="onePager"
//                     accept=".pdf"
//                     onChange={(e) => setOnePagerFile(e.target.files[0])}
//                     className="w-full p-2 border rounded file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#a96a3f] file:text-white hover:file:opacity-90"
//                     required
//                   />
//                 </div>
//               </div>
//               <div className="flex justify-end gap-3 mt-6">
//                 <button
//                   type="button"
//                   onClick={closeModal}
//                   className="bg-gray-400 text-white px-4 py-2 rounded"
//                   disabled={isSubmitting}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="bg-green-600 text-white px-4 py-2 rounded"
//                   disabled={isSubmitting}
//                 >
//                   {isSubmitting ? "Submitting..." : "Submit Application"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* --- AI SUGGESTION BOT MODAL --- */}
//       {isAiModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
//             <h2 className="text-2xl font-bold mb-4">AI Project Idea Generator</h2>
//             <form onSubmit={handleGenerateIdeas}>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Enter your interests (e.g., "AI", "MERN stack", "cybersecurity")
//               </label>
//               <div className="flex gap-2">
//                 <input
//                   type="text"
//                   value={aiQuery}
//                   onChange={(e) => setAiQuery(e.target.value)}
//                   placeholder="I'm interested in..."
//                   className="w-full p-2 border rounded"
//                 />
//                 <button
//                   type="submit"
//                   className="bg-purple-600 text-white px-4 py-2 rounded"
//                   disabled={isAiLoading}
//                 >
//                   {isAiLoading ? "..." : "Generate"}
//                 </button>
//               </div>
//             </form>

//             <div className="mt-4 max-h-80 overflow-y-auto space-y-3 pr-2">
//               {isAiLoading && (
//                 <p className="text-center text-gray-600">Generating ideas based on your interests and past projects...</p>
//               )}
//               {aiIdeas.length > 0 && (
//                 <div className="space-y-4">
//                   <h3 className="font-semibold">Here are some ideas for you:</h3>
//                   {aiIdeas.map((idea, index) => (
//                     <div key={index} className="p-3 border rounded-md bg-gray-50">
//                       <h4 className="font-bold text-purple-800">{idea.title}</h4>
//                       <p className="text-sm text-gray-700">{idea.description}</p>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             <div className="flex justify-end mt-6">
//               <button
//                 type="button"
//                 onClick={() => setIsAiModalOpen(false)}
//                 className="bg-gray-400 text-white px-4 py-2 rounded"
//                 disabled={isAiLoading}
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// }

// export default ViewProjects;


import React, { useEffect, useState, useMemo } from "react";
import { ApiCall } from "../../api/apiCall";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000"; 

function ViewProjects() {
  const [availableProjects, setAvailableProjects] = useState([]);
  const [pastProjects, setPastProjects] = useState([]); // For AI context
  const [myProject, setMyProject] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [myProposals, setMyProposals] = useState([]); // For checking "Applied" status
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);

  // States for the application modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [onePagerFile, setOnePagerFile] = useState(null);
  const [pitchDescription, setPitchDescription] = useState("");
  const [supervisorId, setSupervisorId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for AI Suggestion Bot
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiIdeas, setAiIdeas] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);


  const token = JSON.parse(localStorage.getItem("userInfo"))?.token || null;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all data in parallel
        const [studentData, projectsData, teachersData, pastProjectsData, proposalsData] = await Promise.all([
          ApiCall({ route: "student/dashboard-data", verb: "get", token: token }),
          ApiCall({ route: "projects/available", verb: "get", token: token }),
          ApiCall({ route: "teachers", verb: "get", token: token }),
          ApiCall({ route: "past-projects", verb: "get", token: token }), // For AI context
          ApiCall({ route: "proposals/my-proposals", verb: "get", token: token }), // For "Applied" tag
        ]);

        if (studentData.project) {
          setMyProject(studentData.project);
        }
        setAvailableProjects(Array.isArray(projectsData) ? projectsData : []);
        setTeachers(Array.isArray(teachersData) ? teachersData : []);
        setPastProjects(Array.isArray(pastProjectsData) ? pastProjectsData : []);
        setMyProposals(Array.isArray(proposalsData) ? proposalsData : []);
      } catch (err) {
        toast.error(err?.message || "Failed to fetch project data");
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchData();
    } else {
      setLoading(false);
      toast.error("Not logged in");
    }
  }, [token, refresh]);

  // ===================================
  // ✅ 1. BUG FIX: "Apply" button logic is now correct
  // ===================================
  const pendingApplicationIds = useMemo(() => {
    return new Set(
      myProposals
        .filter(p => p.originProject && 
          // Check all pending statuses
          (p.status === 'pending_onepager' || p.status === 'pending_proposal' || p.status === 'pending_final_approval'))
        .map(p => p.originProject._id) // Use the populated _id
    );
  }, [myProposals]); // Dependency array was missing, now fixed

  // --- Application Modal Handlers ---
  const openApplicationModal = (project) => {
    setSelectedProject(project);
    // If project already has a supervisor, pre-fill it
    if (project.supervisor?._id) {
      setSupervisorId(project.supervisor._id);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
    setOnePagerFile(null);
    setPitchDescription("");
    setSupervisorId("");
  };

  // ===================================
  // ✅ 2. BUG FIX: Supervisor check is now correct
  // ===================================
  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    if (!onePagerFile) {
      toast.error("A One-Pager (PDF) is required to apply.");
      return;
    }

    // If supervisor wasn't pre-filled (admin project), student must choose
    // if (!supervisorId) {
    //   toast.error("You must select a supervisor to apply.");
    //   return;
    // }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("title", selectedProject.title);
    formData.append("supervisor", supervisorId); // Send the selected supervisor
    formData.append("originProject", selectedProject._id);
    formData.append("onePager", onePagerFile);
    formData.append("description", pitchDescription || `Application for ${selectedProject.title}`);

    try {
      const res = await fetch(`${API_URL}/api/proposals`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Application submitted successfully!");
      closeModal();
      setRefresh(!refresh);
    } catch (err) {
      toast.error(err.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- AI Bot Modal Handlers ---
  const handleGenerateIdeas = async (e) => {
    e.preventDefault();
    if (!aiQuery) {
      toast.error("Please enter your interests.");
      return;
    }
    
    setIsAiLoading(true);
    setAiIdeas([]);

    // 1. Get past project titles for context
    const pastTitles = pastProjects
      .map(p => p.title)
      .sort(() => 0.5 - Math.random()) // Shuffle
      .slice(0, 10) // Get 10 random titles
      .join(", ");

    // 2. Define the System Prompt
    const systemPrompt = "You are a helpful Computer Science professor. Your goal is to suggest 5 innovative Final Year Project (FYP) ideas for a university student. You must return your answer *only* as a valid JSON array of objects, with each object having a 'title' and 'description' key.";

    // 3. Define the User Query
    const userQuery = `My interests are: "${aiQuery}".
Based on my interests and the context of these past projects from my university (${pastTitles}), please generate 5 new project ideas.`;

    // 4. Define the JSON Schema for the response
    const jsonSchema = {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          "title": { "type": "STRING" },
          "description": { "type": "STRING" }
        },
        required: ["title", "description"]
      }
    };
    
    // 5. Construct the API Payload
    const payload = {
      contents: [{ parts: [{ text: userQuery }] }],
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: jsonSchema,
      },
      tools: [{ "google_search": {} }] 
    };

    const apiKey = ""; // API key is handled by Canvas
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Failed to get ideas from AI. Please try again.");
      }
      
      const result = await response.json();
      const text = result.candidates[0].content.parts[0].text;
      const ideas = JSON.parse(text);
      setAiIdeas(ideas);

    } catch (err) {
      console.error("AI Error:", err);
      toast.error(err.message);
      setAiIdeas([]);
    } finally {
      setIsAiLoading(false);
    }
  };


  if (loading) return <p className="text-center mt-10">Loading projects...</p>;

  // ===================================
  // ✅ 3. JSX RESTRUCTURED AS REQUESTED
  // ===================================
  return (
    <div className="p-6">
      
      {/* --- 1. Show "My Project" at the top if it exists --- */}
      {myProject && (
        <div className="mb-8 bg-white p-6 shadow-lg rounded-lg border-2 border-green-600">
          <h2 className="text-2xl font-bold mb-4 text-green-700">My Current Project</h2>
          <h3 className="text-xl font-semibold text-[#a96a3f]">{myProject.title}</h3>
          {myProject.supervisor && (
            <p className="text-gray-600 mt-1">
              Supervisor: {myProject.supervisor.name}
            </p>
          )}
          <p className="text-gray-700 mt-2">{myProject.description}</p>
          <Link 
            to="/student-dashboard" 
            className="inline-block mt-4 bg-[#a96a3f] text-white px-4 py-2 rounded hover:opacity-90"
          >
            Go to Dashboard
          </Link>
        </div>
      )}

      {/* --- 2. Show "Available Projects" and AI Button --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">
          {/* Change title if user already has a project */}
          {myProject ? "Other Available Projects" : "Available Projects"}
        </h1>
        {/* --- AI SUGGESTION BUTTON --- */}
        <button
          onClick={() => setIsAiModalOpen(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded shadow-lg hover:bg-purple-700 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12L17 14.188l-1.25-2.188L13.5 11l2.188-1.25L17 7.5l1.25 2.188L20.5 11l-2.188 1.25z" />
          </svg>
          Get AI Project Suggestions
        </button>
      </div>
      
      {availableProjects.length === 0 && !myProject ? ( // Show only if they have NO projects at all
        <p className="text-center text-gray-600">
          No available projects at this time. You can propose your own on your dashboard.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* --- Project Card Mapping --- */}
          {availableProjects.map((project) => {
            // ✅ 4. Don't show the student's own project in this list
            if (myProject && project._id === myProject._id) return null;

            const hasApplied = pendingApplicationIds.has(project._id);
            const isAdminSuggested = project.origin === 'admin';

            return (
              <div 
                key={project._id} 
                className="bg-white shadow-lg rounded-lg p-5 flex flex-col justify-between relative"
              >
                {/* --- TAGS --- */}
                {isAdminSuggested && (
                  <span className="absolute top-2 right-2 text-xs font-semibold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                    Admin Suggested
                  </span>
                )}
                {hasApplied && (
                  <span className="absolute top-2 left-2 text-xs font-semibold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                    Application Pending
                  </span>
                )}
                {/* --- END TAGS --- */}
                
                <div>
                  <h3 className="text-lg font-bold text-[#a96a3f] pt-5">{project.title}</h3>
                  <p className="text-sm font-medium text-gray-600 my-2">
                    Supervisor: {project.supervisor?.name || "Not yet assigned"}
                  </p>
                  <p className="text-gray-700 text-sm mt-2">{project.description}</p>
                </div>
                
                <button
                  onClick={() => openApplicationModal(project)}
                  className={`mt-4 text-white w-full py-2 rounded font-semibold ${
                    hasApplied 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                  }`}
                  disabled={hasApplied}
                >
                  {hasApplied ? "Applied" : "Apply for this Project"}
                </button>
              </div>
            );
          })}
        </div>
      )}
      
      {/* --- Application Modal --- */}
      {isModalOpen && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-2">Apply for Project</h2>
            <h3 className="text-lg mb-4 font-semibold text-[#a96a3f]">{selectedProject.title}</h3>
            
            <form onSubmit={handleApplicationSubmit}>
              <div className="space-y-4">

                {/* --- Conditional Supervisor Dropdown --- */}
                {selectedProject.supervisor ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Supervisor (Pre-assigned)</label>
                    <input
                      type="text"
                      value={selectedProject.supervisor.name}
                      disabled
                      className="w-full p-2 border rounded bg-gray-100"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Select a Supervisor (Optional)
                    </label>
                    <select
                      name="supervisor"
                      value={supervisorId}
                      onChange={(e) => setSupervisorId(e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Choose a supervisor for this project</option>
                      {teachers.map(teacher => (
                        <option key={teacher._id} value={teacher._id}>
                          {teacher.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {/* --- End of Conditional Logic --- */}

                <textarea
                  name="description"
                  placeholder="Add a short description or pitch (Optional)"
                  value={pitchDescription}
                  onChange={(e) => setPitchDescription(e.target.value)}
                  className="w-full p-2 border rounded"
                  rows="3"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload One-Pager (PDF Required)
                  </label>
                  <input
                    type="file"
                    name="onePager"
                    accept=".pdf"
                    onChange={(e) => setOnePagerFile(e.target.files[0])}
                    className="w-full p-2 border rounded file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#a96a3f] file:text-white hover:file:opacity-90"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
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
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- AI SUGGESTION BOT MODAL --- */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">AI Project Idea Generator</h2>
            <form onSubmit={handleGenerateIdeas}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter your interests (e.g., "AI", "MERN stack", "cybersecurity")
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="I'm interested in..."
                  className="w-full p-2 border rounded"
                />
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-4 py-2 rounded"
                  disabled={isAiLoading}
                >
                  {isAiLoading ? "..." : "Generate"}
                </button>
              </div>
            </form>

            <div className="mt-4 max-h-80 overflow-y-auto space-y-3 pr-2">
              {isAiLoading && (
                <p className="text-center text-gray-600">Generating ideas based on your interests and past projects...</p>
              )}
              {aiIdeas.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Here are some ideas for you:</h3>
                  {aiIdeas.map((idea, index) => (
                    <div key={index} className="p-3 border rounded-md bg-gray-50">
                      <h4 className="font-bold text-purple-800">{idea.title}</h4>
                      <p className="text-sm text-gray-700">{idea.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
                disabled={isAiLoading}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ViewProjects;