import { useState } from "react";
import { ApiCall } from "../api/apiCall";

function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await ApiCall({
        route: "auth/register",
        verb: "post",
        data: form,
      });
      alert("Admin registered successfully");
      console.log(res);
    } catch (err) {
      alert(err.message || "Registration failed");
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-10 p-6 border rounded-md shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-center">Admin Registration</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="text" name="name" placeholder="Name" value={form.name} onChange={handleChange} required className="w-full p-2 border rounded" />
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required className="w-full p-2 border rounded" />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required className="w-full p-2 border rounded" />
        <button type="submit" className="bg-[#a96a3f] text-white w-full py-2 rounded hover:opacity-90">Register</button>
      </form>
    </div>
  );
}

export default Register;
