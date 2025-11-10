import React, { useEffect, useState } from "react";
import { ApiCall } from "../../api/apiCall";
import { toast } from "react-toastify";

// We need the *full* base URL for displaying file links
const API_URL = "http://localhost:5000"; // Or your backend URL

function ManageFormats() {
  const [formats, setFormats] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState("Proposal");
  const [uploading, setUploading] = useState(false);

  const token = JSON.parse(localStorage.getItem("userInfo"))?.token || null;

  useEffect(() => {
    const fetchFormats = async () => {
      try {
        const res = await ApiCall({
          route: "document-formats",
          verb: "get",
          token: token,
        });
        setFormats(Array.isArray(res) ? res : []);
      } catch (err) {
        toast.error(err?.message || "Failed to fetch formats");
      }
    };
    fetchFormats();
  }, [refresh, token]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !fileType) {
      toast.error("Please select a file type and a file to upload.");
      return;
    }

    // 1. We must use FormData for file uploads
    const formData = new FormData();
    formData.append("document", file); // 'document' must match multer middleware
    formData.append("fileType", fileType);

    setUploading(true);
    try {
      // 2. We bypass ApiCall and use fetch directly
      const res = await fetch(`${API_URL}/api/document-formats`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // "Content-Type" is set automatically by the browser with FormData
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Upload failed");
      }

      toast.success(`'${fileType}' format uploaded successfully!`);
      setFile(null);
      e.target.reset(); // Clear file input
      setRefresh(!refresh);
    } catch (err) {
      toast.error(err.message || "Error uploading file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Document Formats</h1>

      {/* Upload Form */}
      <div className="mb-6 bg-white p-4 shadow rounded-lg max-w-lg">
        <h2 className="text-xl font-semibold mb-3">Upload New Format</h2>
        <p className="text-sm text-gray-600 mb-3">
          Uploading a new format (e.g., "Proposal") will replace any existing
          file of the same type.
        </p>
        <form onSubmit={handleUpload} className="space-y-3">
          <select
            value={fileType}
            onChange={(e) => setFileType(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="Proposal">Proposal Format</option>
            <option value="One Pager">One Pager Format</option>
            <option value="Documentation">Documentation Format</option>
          </select>
          <input
            type="file"
            onChange={handleFileChange}
            required
            className="w-full p-2 border rounded file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#a96a3f] file:text-white hover:file:opacity-90"
          />
          <button
            type="submit"
            disabled={uploading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:opacity-90 disabled:bg-gray-400"
          >
            {uploading ? "Uploading..." : "Upload File"}
          </button>
        </form>
      </div>

      {/* Current Formats List */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Current Formats</h2>
        <div className="space-y-3">
          {formats.length === 0 ? (
            <p>No formats uploaded yet.</p>
          ) : (
            formats.map((format) => (
              <div
                key={format._id}
                className="bg-white p-3 shadow rounded flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold">{format.fileType}</h3>
                  <p className="text-sm text-gray-500">{format.fileName}</p>
                </div>
                <a
                  href={`${API_URL}/${format.filePath.replace(/\\/g, '/')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:opacity-90"
                >
                  Download
                </a>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ManageFormats;