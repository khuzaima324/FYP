import React, { useEffect, useState } from "react";
import { ApiCall } from "../../api/apiCall";
import { toast } from "react-toastify";

function ViewPastProjects() {
  const [projects, setProjects] = useState([]); // Stores the master list
  const [filteredProjects, setFilteredProjects] = useState([]); // Stores the list to display
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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
        setFilteredProjects(Array.isArray(res) ? res : []);
      } catch (err) {
        toast.error(err?.message || "Failed to fetch past projects");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [token]);

  // 2. Filter projects whenever the search term or master list changes
  useEffect(() => {
    const lowerSearch = search.toLowerCase();
    
    if (lowerSearch === "") {
      setFilteredProjects(projects); // No search, show all
      return;
    }

    const filtered = projects.filter(p => {
      // Check all relevant fields
      return (
        p.title.toLowerCase().includes(lowerSearch) ||
        p.session.toLowerCase().includes(lowerSearch) ||
        p.supervisorName.toLowerCase().includes(lowerSearch) ||
        p.description.toLowerCase().includes(lowerSearch) ||
        (p.studentNames || []).join(", ").toLowerCase().includes(lowerSearch)
      );
    });
    setFilteredProjects(filtered);
  }, [search, projects]);


  if (loading) return <p className="text-center mt-10">Loading project archive...</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Past Projects Archive</h1>
      <p className="text-gray-600 mb-6">
        Browse projects completed by previous students.
      </p>
      
      {/* Search Bar */}
      <div className="mb-6 max-w-lg">
        <input
          type="text"
          placeholder="Search by title, session, supervisor, or keyword..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
        />
      </div>

      {/* Project List */}
      {filteredProjects.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">
          {search ? "No projects match your search." : "No past projects found in the archive."}
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
                <p><strong>Supervisor:</strong> {project.supervisorName}</p>
                <p><strong>By:</strong> {(project.studentNames || []).join(", ")}</p>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 flex-grow">
                {project.description}
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