import { useEffect, useState } from "react";
import { ApiCall } from "../../api/apiCall";

function StudentTable() {
  const [students, setStudents] = useState([]);

  const fetchStudents = async () => {
    try {
      const res = await ApiCall({ route: "students", verb: "get" });
      setStudents(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="p-4">
      <h2>Student List</h2>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Name</th>
            <th>Roll #</th>
            <th>Email</th>
            <th>Department</th>
            <th>Semester</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s._id}>
              <td>{s.name}</td>
              <td>{s.rollNumber}</td>
              <td>{s.email}</td>
              <td>{s.department}</td>
              <td>{s.semester}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StudentTable;
