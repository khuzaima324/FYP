import React, { useEffect, useState } from "react";
import { ApiCall } from "../../api/apiCall";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

function ViewProjects() {
  const [availableProjects, setAvailableProjects] = useState([]);
  const [myProject, setMyProject] = useState(null); // To store student's assigned project
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false); // To reload data after selecting

  const token = JSON.parse(localStorage.getItem("userInfo"))?.token || null;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // We fetch two things:
        // 1. The student's current data (to see if they have a project)
        // 2. The list of all available projects
        const [studentData, projectsData] = await Promise.all([
          ApiCall({ route: "student/dashboard-data", verb: "get", token: token }),
          ApiCall({ route: "projects/available", verb: "get", token: token }),
        ]);

        if (studentData.project) {
          setMyProject(studentData.project);
        }
        setAvailableProjects(Array.isArray(projectsData) ? projectsData : []);

      } catch (err) {
        toast.error(err?.message || "Failed to fetch project data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, refresh]);

  const handleSelectProject = async (projectId, projectTitle) => {
    if (!window.confirm(`Are you sure you want to select this project?\n\n"${projectTitle}"`)) {
      return;
    }

    try {
      // This new API route will assign the student to the project
      await ApiCall({
        route: `projects/${projectId}/select`,
        verb: "put",
        token: token,
      });
      toast.success("Project selected successfully!");
      setRefresh(!refresh); // Refresh the page to show their new status
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to select project");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading projects...</p>;

  // --- 1. If Student ALREADY has a project ---
  if (myProject) {
    return (
      <div className="max-w-2xl mx-auto text-center bg-white p-8 shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold mb-4">You Have a Project!</h2>
        <p className="text-gray-700 mb-2">You are already assigned to the following project:</p>
        <h3 className="text-xl font-semibold text-[#a96a3f]">{myProject.title}</h3>
        {myProject.supervisor && (
          <p className="text-gray-600 mt-1">
            Supervisor: {myProject.supervisor.name}
          </p>
        )}
        <Link 
          to="/student-dashboard" 
          className="inline-block mt-6 bg-[#a96a3f] text-white px-4 py-2 rounded hover:opacity-90"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // --- 2. If Student has NO project ---
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Available Projects</h1>
      
      {availableProjects.length === 0 ? (
        <p className="text-center text-gray-600">
          No available projects at this time. You can propose your own on your dashboard.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableProjects.map((project) => (
            <div 
              key={project._id} 
              className="bg-white shadow-lg rounded-lg p-5 flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-bold text-[#a96a3f]">{project.title}</h3>
                <p className="text-sm font-medium text-gray-600 my-2">
                  Supervisor: {project.supervisor?.name || "Not yet assigned"}
                </p>
                <p className="text-gray-700 text-sm mt-2">{project.description}</p>
              </div>
              <button
                onClick={() => handleSelectProject(project._id, project.title)}
                className="mt-4 bg-green-600 text-white w-full py-2 rounded font-semibold hover:bg-green-700"
              >
                Select this Project
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ViewProjects;