import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import Home from "./pages/Home";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManagePastProjects from "./Pages/admin/ManagePastProjects";
import ManageStudents from "./pages/admin/ManageStudents";
import ManageTeachers from "./pages/admin/ManageTeachers";
import AdminProfile from "./pages/admin/AdminProfile";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          <Route path="/admin-dashboard" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/manage-students" element={
            <ProtectedRoute>
              <ManageStudents />
            </ProtectedRoute>
          } />

          <Route path="/manage-teachers" element={
            <ProtectedRoute>
              <ManageTeachers />
            </ProtectedRoute>
          } />

          <Route path="/admin-profile" element={
            <ProtectedRoute>
              <AdminProfile />
            </ProtectedRoute>
          } />

          <Route path="/manage-past-projects" element={
            <ProtectedRoute>
              <ManagePastProjects />
            </ProtectedRoute>
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>
          <ToastContainer />
      </div>
      <Footer />
    </div>
  );
}

export default App;
