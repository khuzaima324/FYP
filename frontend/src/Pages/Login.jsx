import { useState } from "react";
import { ApiCall } from "../api/apiCall";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await ApiCall({
        route: "admin/login",
        verb: "post",
        data: form,
      });
      localStorage.setItem("userInfo", JSON.stringify(res));
      alert("Login successful!");
      window.location.href = "/dashboard";
    } catch (err) {
      alert(err.message || "Login failed");
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-10 p-6 border rounded-md shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-center">Admin Login</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required className="w-full p-2 border rounded" />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required className="w-full p-2 border rounded" />
        <button type="submit" className="bg-[#a96a3f] text-white w-full py-2 rounded hover:opacity-90">Login</button>
      </form>
    </div>
  );
}

export default Login;
