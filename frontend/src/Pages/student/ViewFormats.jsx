import React, { useEffect, useState } from "react";
import { ApiCall } from "../../api/apiCall";
import { toast } from "react-toastify";

// We need the *full* base URL for constructing the download links
// Make sure this matches your backend's port.
const API_URL = "http://localhost:5000";

function ViewFormats() {
  const [formats, setFormats] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = JSON.parse(localStorage.getItem("userInfo"))?.token || null;

  useEffect(() => {
    const fetchFormats = async () => {
      setLoading(true);
      try {
        // This route is accessible by all logged-in users
        const res = await ApiCall({
          route: "document-formats",
          verb: "get",
          token: token,
        });
        setFormats(Array.isArray(res) ? res : []);
      } catch (err) {
        toast.error(err?.message || "Failed to fetch formats");
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchFormats();
    } else {
      setLoading(false);
      toast.error("You are not logged in.");
    }
  }, [token]);

  if (loading) {
    return <p className="text-center mt-10">Loading document formats...</p>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Document Formats</h1>
      <p className="text-gray-600 mb-6">
        Download the required templates and formats for your project submissions.
      </p>

      <div className="space-y-4">
        {formats.length === 0 ? (
          <p className="text-center text-gray-500 p-4 bg-gray-50 rounded-lg">
            No document formats have been uploaded by the admin yet.
          </p>
        ) : (
          formats.map((format) => (
            <div
              key={format._id}
              className="bg-white shadow rounded-lg p-4 flex justify-between items-center border"
            >
              <div>
                <h3 className="text-lg font-semibold text-[#a96a3f]">
                  {format.fileType} Format
                </h3>
                <p className="text-sm text-gray-500">{format.fileName}</p>
              </div>
              <a
                // Construct the full URL. Replace backslashes (Windows) with forward slashes (URL)
                href={`${API_URL}/${format.filePath.replace(/\\/g, "/")}`}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700"
              >
                Download
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ViewFormats;