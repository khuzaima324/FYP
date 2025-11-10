// import { useState } from "react";
// import { ApiCall } from "../api/apiCall";

// function Login() {
//   const [form, setForm] = useState({ email: "", password: "" });

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await ApiCall({
//         route: "admin/login",
//         verb: "post",
//         data: form,
//       });
//       localStorage.setItem("userInfo", JSON.stringify(res));
//       alert("Login successful!");
//       window.location.href = "/dashboard";
//     } catch (err) {
//       alert(err.message || "Login failed");
//     }
//   };

//   return (
//     <div className="max-w-sm mx-auto mt-10 p-6 border rounded-md shadow-md">
//       <h2 className="text-xl font-semibold mb-4 text-center">Admin Login</h2>
//       <form onSubmit={handleSubmit} className="space-y-3">
//         <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required className="w-full p-2 border rounded" />
//         <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required className="w-full p-2 border rounded" />
//         <button type="submit" className="bg-[#a96a3f] text-white w-full py-2 rounded hover:opacity-90">Login</button>
//       </form>
//     </div>
//   );
// }

// export default Login;

import { useState } from "react";
import { ApiCall } from "../api/apiCall";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [role, setRole] = useState("student"); // Default to 'student'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    let route = "";
    let redirectPath = "";

    // 1. Determine API route and redirect path based on role
    if (role === "admin") {
      route = "admin/login";
      redirectPath = "/admin-dashboard";
    } else if (role === "teacher") {
      route = "teacher/login";
      redirectPath = "/teacher-dashboard";
    } else {
      route = "student/login";
      redirectPath = "/student-dashboard";
    }

    try {
      const res = await ApiCall({
        route: route,
        verb: "post",
        data: form,
      });
      
      localStorage.setItem("userInfo", JSON.stringify(res));
      toast.success("Login successful!");
      navigate(redirectPath);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper for tab styling
  const getTabClass = (tabRole) => {
    return role === tabRole
      ? "bg-white text-[#a96a3f] font-semibold"
      : "bg-transparent text-white opacity-80 hover:opacity-100";
  };

  return (
    <div className="max-w-sm mx-auto mt-10 p-6 border rounded-md shadow-md bg-[#a96a3f] text-white">
      
      {/* 2. Role Selection Tabs */}
      <div className="flex justify-around mb-4 rounded-md p-1 bg-black bg-opacity-10">
        <button
          type="button"
          onClick={() => setRole("student")}
          className={`w-full py-2 rounded ${getTabClass("student")}`}
        >
          Student
        </button>
        <button
          type="button"
          onClick={() => setRole("teacher")}
          className={`w-full py-2 rounded ${getTabClass("teacher")}`}
        >
          Teacher
        </button>
        <button
          type="button"
          onClick={() => setRole("admin")}
          className={`w-full py-2 rounded ${getTabClass("admin")}`}
        >
          Admin
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-4 text-center capitalize">
        {role} Login
      </h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded text-black"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded text-black"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-white text-[#a96a3f] w-full py-2 rounded font-bold hover:opacity-90 disabled:bg-gray-300"
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default Login;