import React, { useEffect, useState, useMemo } from "react"; // 1. Import useMemo
import { ApiCall } from "../../api/apiCall";
import { toast } from "react-toastify";

function ViewPastProjects() {
  const [projects, setProjects] = useState([]); // Stores the master list
  const [loading, setLoading] = useState(true);
  
  // ===================================
  // ✅ 2. NEW STATE FOR FILTERS
  // ===================================
  const [search, setSearch] = useState("");
  const [filterSession, setFilterSession] = useState("");
  const [filterSupervisor, setFilterSupervisor] = useState("");
  const [filterDept, setFilterDept] = useState("");

  const token = JSON.parse(localStorage.getItem("userInfo"))?.token || null;

  // 1. Fetch all past projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const res = await ApiCall({
          route: "past-projects",
          verb: "get",
          token: token,
        });
        setProjects(Array.isArray(res) ? res : []);
      } catch (err) {
        toast.error(err?.message || "Failed to fetch past projects");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [token]);

  // ===================================
  // ✅ 3. NEW LOGIC FOR FILTERS & SORTING
  // ===================================
  
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

  // Replaced your useEffect with useMemo for filtering and sorting
  const filteredProjects = useMemo(() => {
    const lowerSearch = search.toLowerCase().trim();

    // 1. FILTERING
    const filtered = projects.filter(p => {
      // Apply all dropdown filters
      if (filterSession && p.session !== filterSession) return false;
      if (filterDept && p.department !== filterDept) return false;
      if (filterSupervisor && p.supervisorName !== filterSupervisor) return false;
      
      // Apply search term
      if (!lowerSearch) return true; // Pass if no search term

      const studentNames = (p.studentNames || []).join(", ").toLowerCase();
      const rollNumbers = (p.studentRollNumbers || []).join(", ").toLowerCase();

      return (
        p.title.toLowerCase().includes(lowerSearch) ||
        (p.groupName || "").toLowerCase().includes(lowerSearch) ||
        (p.supervisorName || "").toLowerCase().includes(lowerSearch) ||
        studentNames.includes(lowerSearch) ||
        rollNumbers.includes(lowerSearch) ||
        (p.department || "").toLowerCase().includes(lowerSearch)
      );
    });
    
    // 2. SORTING (as requested)
    filtered.sort((a, b) => {
      // Primary sort: Session (descending)
      const sessionCompare = b.session.localeCompare(a.session);
      if (sessionCompare !== 0) return sessionCompare;

      // Secondary sort: Group Name (natural, ascending)
      const groupA = a.groupName || "";
      const groupB = b.groupName || "";

      if (groupA && !groupB) return -1; // Grouped items first
      if (!groupA && groupB) return 1;  // Ungrouped items last

      // Both have groups (or both don't), sort them naturally
      return groupA.localeCompare(groupB, undefined, { numeric: true, sensitivity: 'base' });
    });
    
    return filtered;

  }, [projects, search, filterSession, filterSupervisor, filterDept]);


  if (loading) return <p className="text-center mt-10">Loading project archive...</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Past Projects Archive</h1>
      <p className="text-gray-600 mb-6">
        Browse projects completed by previous students.
      </p>
      
      {/* =================================== */}
      {/* ✅ 4. NEW SEARCH & FILTER BAR */}
      {/* =================================== */}
      <div className="mb-6 bg-white p-4 shadow rounded-lg">
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
      {filteredProjects.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">
          {projects.length === 0 ? "No past projects found in the archive." : "No projects match your search."}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <div 
              key={project._id} 
              className="bg-white shadow-lg rounded-lg p-5 flex flex-col border"
            >
              {/* Card Header */}
              <div>
                <span className="text-sm font-semibold text-[#a96a3f]">{project.session}</span>
                <h3 className="text-xl font-bold text-gray-800 mt-1">{project.title}</h3>
              </div>
              
              {/* Card Body */}
              <div className="my-3 text-sm text-gray-700 space-y-1">
                <p><strong>Group:</strong> {project.groupName || 'N/A'}</p>
                <p><strong>Supervisor:</strong> {project.supervisorName || 'N/A'}</p>
                <p><strong>By:</strong> {(project.studentNames || []).join(", ")}</p>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 flex-grow">
                {project.description || "No description provided."}
              </p>
              
              {/* Card Footer (Link) */}
              {project.projectLink && (
                <a
                  href={project.projectLink.startsWith('http') ? project.projectLink : `http://${project.projectLink}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-center bg-blue-500 text-white w-full py-2 rounded font-semibold hover:bg-blue-600"
                >
                  View Project/Report
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ViewPastProjects;