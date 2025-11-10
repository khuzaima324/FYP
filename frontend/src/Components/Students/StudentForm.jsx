import { useState } from "react";
import { ApiCall } from "../../api/apiCall";

function StudentForm({ onStudentAdded }) {
  const [formData, setFormData] = useState({
    name: "",
    rollNumber: "",
    email: "",
    department: "",
    semester: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await ApiCall({
        route: "students",
        verb: "post",
        data: formData,
      });
      alert(res.message);
      onStudentAdded(); // refresh table after adding
      setFormData({
        name: "",
        rollNumber: "",
        email: "",
        department: "",
        semester: "",
      });
    } catch (err) {
      alert(err.message || "Error adding student");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-2">
      <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
      <input type="text" name="rollNumber" placeholder="Roll Number" value={formData.rollNumber} onChange={handleChange} required />
      <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
      <input type="text" name="department" placeholder="Department" value={formData.department} onChange={handleChange} required />
      <input type="text" name="semester" placeholder="Semester" value={formData.semester} onChange={handleChange} required />
      <button type="submit">Add Student</button>
    </form>
  );
}

export default StudentForm;
