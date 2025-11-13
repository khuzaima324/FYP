import React, { useEffect, useState, useMemo } from "react";
import { ApiCall } from "../../api/apiCall";
import { toast } from "react-toastify";

function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [supervisorSelections, setSupervisorSelections] = useState({});
  const [groupInputs, setGroupInputs] = useState({});
  const [form, setForm] = useState({
    name: "",
    rollNumber: "",
    email: "",
    department: "",
    session: "",
    semester: "",
    section: "",
    password: "",
    group: "",
  });
  const [search, setSearch] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [refreshToggle, setRefreshToggle] = useState(false);

  // ===================================
  // ✅ 1. CHECKBOX SET TO TRUE BY DEFAULT
  // ===================================
  const [sortByGroup, setSortByGroup] = useState(true);

  const adminInfo = JSON.parse(localStorage.getItem("userInfo"));
  const token = adminInfo?.token || null;

  // --- Group Formatting Helpers ---
  const formatGroupInput = (value) => {
    if (!value) return "";
    return value.toUpperCase().replace(/\s/g, "");
  };

  const normalizeGroupName = (value) => {
    if (!value) return "";
    const str = value.toString().toUpperCase();
    const g = str.includes("G") ? "G" : "";
    const digits = str.replace(/\D/g, "");
    if (g && digits) return `G-${digits}`;
    return "";
  };

  // --- Semester Calculation Helper ---
  const calculateSemester = (sessionString) => {
    // Expects "YYYY-YYYY"
    if (!sessionString || !/^\d{4}-\d{4}$/.test(sessionString)) return "";

    const startYear = parseInt(sessionString.split("-")[0], 10);
    if (isNaN(startYear)) return "";

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11 (Jan=0, Aug=7)

    // Logic: Assume Fall (Sem 1,3,5,7) starts in Aug (month 7)
    const totalMonths = (currentYear - startYear) * 12 + (currentMonth - 7);
    const semesterNumber = Math.floor(totalMonths / 6) + 1;

    if (semesterNumber < 1) return "1st";
    if (semesterNumber > 8) return "Graduated";

    const suffixes = ["th", "st", "nd", "rd"];
    const v = semesterNumber % 100;
    const suffix = suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0];
    return `${semesterNumber}${suffix}`;
  };

  // --- Data Fetching ---
  const fetchStudents = async () => {
    try {
      const res = await ApiCall({
        route: "students",
        verb: "get",
        token,
      });
      // This 'res' must contain the 'projectTitle' for the new logic to work
      setStudents(Array.isArray(res) ? res : res.students || []);
    } catch (err) {
      toast.error(err?.message || "Failed to fetch students");
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await ApiCall({
        route: "teachers",
        verb: "get",
        token,
      });
      setTeachers(Array.isArray(res) ? res : res.teachers || []);
    } catch (err) {
      toast.error("Failed to fetch teachers");
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchTeachers();
  }, [refreshToggle]);

  useEffect(() => {
    // Auto-fill semester ONLY when adding new, not editing
    if (!editingStudent) {
      // Only calculate if the session format is complete
      if (form.session.length === 9 && /^\d{4}-\d{4}$/.test(form.session)) {
        const calculated = calculateSemester(form.session);
        setForm((f) => ({ ...f, semester: calculated }));
      }
      // Clear semester if session is emptied
      else if (form.session.length === 0) {
        setForm((f) => ({ ...f, semester: "" }));
      }
    }
  }, [form.session, editingStudent]);

  // --- Form Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "group") {
      setForm({ ...form, [name]: formatGroupInput(value) });
    } else if (name === "session") {
      // Auto-format session to YYYY-YYYY
      let cleanValue = value.replace(/\D/g, ""); // Remove non-digits
      if (cleanValue.length > 4) {
        cleanValue = `${cleanValue.slice(0, 4)}-${cleanValue.slice(4, 8)}`;
      }
      setForm({ ...form, [name]: cleanValue });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !form.name ||
      !form.rollNumber ||
      !form.email ||
      !form.department ||
      !form.session ||
      !form.semester ||
      !form.section
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!/^\d{4}-\d{4}$/.test(form.session)) {
      toast.error("Session format must be YYYY-YYYY (e.g., 2022-2026)");
      return;
    }

    const dataToSend = {
      ...form,
      group: normalizeGroupName(form.group),
    };

    try {
      if (editingStudent) {
        await ApiCall({
          route: `students/${editingStudent._id}`,
          verb: "put",
          data: dataToSend,
          token,
        });
        toast.success("Student updated successfully");
        setEditingStudent(null);
      } else {
        await ApiCall({
          route: "students",
          verb: "post",
          data: dataToSend,
          token,
        });
        toast.success("Student added successfully");
      }

      setForm({
        name: "",
        rollNumber: "",
        email: "",
        department: "",
        session: "", // Reset
        semester: "",
        section: "",
        password: "",
        group: "",
      });
      setRefreshToggle((s) => !s);
    } catch (err) {
      toast.error(err?.message || "Error saving student");
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setForm({
      name: student.name || "",
      rollNumber: student.rollNumber || "",
      email: student.email || "",
      department: student.department || "",
      session: student.session || "", // Populate
      semester: student.semester || "",
      section: student.section || "",
      password: "",
      group: student.group || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingStudent(null);
    setForm({
      name: "",
      rollNumber: "",
      email: "",
      department: "",
      session: "", // Reset
      semester: "",
      section: "",
      password: "",
      group: "",
    });
  };

  // --- Table Action Handlers ---
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      await ApiCall({ route: `students/${id}`, verb: "delete", token });
      toast.success("Student deleted");
      setRefreshToggle((s) => !s);
    } catch (err) {
      toast.error(err?.message || "Error deleting student");
    }
  };

  const assignSupervisor = async (studentId) => {
    const supervisorId = supervisorSelections[studentId];
    if (!supervisorId) {
      toast.error("Please select a supervisor");
      return;
    }
    try {
      await ApiCall({
        route: `students/${studentId}/supervisor`,
        verb: "put",
        data: { supervisorId: supervisorId },
        token,
      });
      toast.success("Supervisor assigned successfully");
      setSupervisorSelections((prev) => ({
        ...prev,
        [studentId]: undefined,
      }));
      setRefreshToggle((s) => !s);
    } catch (err) {
      toast.error("Error assigning supervisor");
    }
  };

  const assignGroup = async (studentId) => {
    const groupName = groupInputs[studentId];
    const formattedGroupName = normalizeGroupName(groupName);

    if (!formattedGroupName) {
      toast.error("Enter a valid group name (e.g., G1 or G-1)");
      return;
    }

    try {
      await ApiCall({
        route: `students/${studentId}/group`,
        verb: "put",
        data: { groupName: formattedGroupName },
        token,
      });
      toast.success("Group assigned successfully");
      setGroupInputs((prev) => ({ ...prev, [studentId]: "" }));
      setRefreshToggle((s) => !s);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error assigning group");
    }
  };

  // --- Filter Logic ---
  const groupColors = [
    "bg-blue-100",
    "bg-green-100",
    "bg-yellow-100",
    "bg-indigo-100",
    "bg-pink-100",
    "bg-purple-100",
    "bg-orange-100",
  ];

  // This hook filters, sorts, and creates the color map all at once
  const { processedStudents, groupColorMap } = useMemo(() => {
    // 1. Filtering logic (from your original code)
    let filtered = students.filter((s) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (s.name || "").toLowerCase().includes(q) ||
        (s.rollNumber || "").toLowerCase().includes(q) ||
        (s.email || "").toLowerCase().includes(q) ||
        (s.group || "")
          .toLowerCase()
          .replace("-", "")
          .includes(q.replace("-", "")) ||
        (s.session || "").toLowerCase().includes(q);

      const matchesSection =
        !filterSection || (s.section || "") === filterSection;
      const matchesDept = !filterDept || (s.department || "") === filterDept;
      return matchesSearch && matchesSection && matchesDept;
    });

    const newColorMap = {};

    // 2. Sorting logic (if checkbox is checked)
    if (sortByGroup) {
      filtered.sort((a, b) => {
        const groupA = a.group || ""; // Treat null/undefined as ""
        const groupB = b.group || "";

        if (groupA && !groupB) return -1; // A (has group) comes before B (no group)
        if (!groupA && groupB) return 1; // B comes before A
        if (!groupA && !groupB) return 0; // Both no group, same order

        // Both have groups, sort alphabetically
        return groupA.localeCompare(groupB);
      });

      // 3. Generate Color Map
      let colorIndex = 0;
      const uniqueGroups = [
        ...new Set(filtered.map((s) => s.group).filter(Boolean)),
      ];

      uniqueGroups.forEach((groupName) => {
        newColorMap[groupName] = groupColors[colorIndex % groupColors.length];
        colorIndex++;
      });
    }

    return { processedStudents: filtered, groupColorMap: newColorMap };
  }, [students, search, filterSection, filterDept, sortByGroup]);

  // --- JSX Return ---
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        {editingStudent ? "Edit Student" : "Manage Students"}
      </h1>

      {/* Add/Edit Form */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-3 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
            className="p-2 border rounded"
          />
          <input
            name="rollNumber"
            placeholder="Roll Number"
            value={form.rollNumber}
            onChange={handleChange}
            required
            className="p-2 border rounded"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="p-2 border rounded"
          />

          <select
            name="department"
            value={form.department}
            onChange={handleChange}
            required
            className="p-2 border rounded"
          >
            <option value="">Select Department</option>
            <option value="BS-IT">BS-IT</option>
            <option value="BS-CS">BS-CS</option>
          </select>

          <input
            name="session"
            type="text"
            placeholder="Session (e.g., 2022-2026)"
            value={form.session}
            onChange={handleChange}
            maxLength="9"
            required
            className="p-2 border rounded"
          />

          <input
            name="semester"
            placeholder="Semester"
            value={form.semester}
            onChange={handleChange}
            required
            className="p-2 border rounded"
          />

          <select
            name="section"
            value={form.section}
            onChange={handleChange}
            required
            className="p-2 border rounded"
          >
            <option value="">Select Section</option>
            <option value="Morning">Morning</option>
            <option value="Evening">Evening</option>
          </select>

          <input
            name="group"
            placeholder="Group Name (e.g. G1)"
            value={form.group}
            onChange={handleChange}
            className="p-2 border rounded"
          />

          <input
            name="password"
            type="password"
            placeholder={
              editingStudent
                ? "Password (leave blank to keep same)"
                : "Password"
            }
            value={form.password}
            onChange={handleChange}
            className="p-2 border rounded"
            required={!editingStudent}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-[#a96a3f] text-white px-4 py-2 rounded"
          >
            {editingStudent ? "Update Student" : "Add Student"}
          </button>
          {editingStudent && (
            <button
              type="button"
              onClick={cancelEdit}
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        {" "}
        {/* Changed gap-3 to gap-4 */}
        <input
          placeholder="Search by name, roll, email, group or session"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded flex-1 min-w-[220px]"
        />
        <select
          value={filterSection}
          onChange={(e) => setFilterSection(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Sections</option>
          <option value="Morning">Morning</option>
          <option value="Evening">Evening</option>
        </select>
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Departments</option>
          <option value="BS-IT">BS-IT</option>
          <option value="BS-CS">BS-CS</option>
        </select>
        {/* =================================== */}
        {/* ✅ 2. CHECKBOX CHECKED STATE UPDATED */}
        {/* =================================== */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="sortGroup"
            checked={sortByGroup}
            onChange={(e) => setSortByGroup(e.target.checked)}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
          />
          <label
            htmlFor="sortGroup"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            Sort & Highlight Groups
          </label>
        </div>
      </div>

      {/* Student Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-3 py-2 text-left">Name</th>
              <th className="border px-3 py-2 text-left">Roll No</th>
              <th className="border px-3 py-2 text-left">Email</th>
              <th className="border px-3 py-2 text-left">Department</th>
              <th className="border px-3 py-2 text-left">Session</th>
              <th className="border px-3 py-2 text-left">Semester</th>
              <th className="border px-3 py-2 text-left">Section</th>
              <th className="border px-3 py-2 text-left">Supervisor</th>
              <th className="border px-3 py-2 text-left">Group</th>
              <th className="border px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {processedStudents.length === 0 ? (
              <tr>
                <td colSpan="10" className="p-4 text-center">
                  No students found
                </td>
              </tr>
            ) : (
              processedStudents.map((s) => {
                // Get the color class for this student's row
                const rowClass =
                  sortByGroup && s.group ? groupColorMap[s.group] : "";

                return (
                  <tr key={s._id} className={`border-t ${rowClass}`}>
                    <td className="px-3 py-2">{s.name}</td>
                    <td className="px-3 py-2">{s.rollNumber}</td>
                    <td className="px-3 py-2">{s.email}</td>
                    <td className="px-3 py-2">{s.department}</td>
                    <td className="px-3 py-2">{s.session}</td>
                    <td className="px-3 py-2">{s.semester}</td>
                    <td className="px-3 py-2">{s.section}</td>
                    <td className="px-3 py-2">
                      {s.supervisor ? (
                        <span>{s.supervisor.name}</span>
                      ) : (
                        <>
                          <select
                            className="p-1 border rounded"
                            value={supervisorSelections[s._id] || ""}
                            onChange={(e) =>
                              setSupervisorSelections({
                                ...supervisorSelections,
                                [s._id]: e.target.value,
                              })
                            }
                          >
                            <option value="">Select</option>
                            {teachers.map((t) => (
                              <option key={t._id} value={t._id}>
                                {t.name}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => assignSupervisor(s._id)}
                            className="ml-2 bg-green-600 text-white px-2 py-1 rounded"
                          >
                            Assign
                          </button>
                        </>
                      )}
                    </td>

                    {/* =================================== */}
                    {/* ✅ 3. UPDATED "GROUP" CELL LOGIC */}
                    {/* =================================== */}
                    <td className="px-3 py-2">
                      {/* 's.projectTitle' must be sent from your backend.
                        This check will fail until your backend is updated.
                      */}
                      {s.projectTitle ? (
                        <div className="flex flex-col">
                          <span className="font-semibold text-green-700">
                            Project Approved
                          </span>
                          <span className="text-xs text-gray-600 truncate" title={s.projectTitle}>
                            {s.projectTitle}
                          </span>
                        </div>
                      ) : s.group ? (
                        // If no project, check for group
                        <span>{s.group}</span>
                      ) : (
                        // If neither, show assign input
                        <>
                          <input
                            placeholder="Group name"
                            value={groupInputs[s._id] || ""}
                            onChange={(e) =>
                              setGroupInputs({
                                ...groupInputs,
                                [s._id]: formatGroupInput(e.target.value),
                              })
                            }
                            className="border p-1 rounded w-24"
                          />
                          <button
                            onClick={() => assignGroup(s._id)}
                            className="ml-2 bg-purple-600 text-white px-2 py-1 rounded"
                          >
                            Set
                          </button>
                        </>
                      )}
                    </td>

                    <td className="px-3 py-2 flex gap-2">
                      <button
                        onClick={() => handleEdit(s)}
                        className="bg-blue-500 text-white px-2 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(s._id)}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManageStudents;