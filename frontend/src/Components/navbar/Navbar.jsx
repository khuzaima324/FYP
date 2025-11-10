// import { useEffect, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";

// function Navbar() {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [isAdmin, setIsAdmin] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const user = JSON.parse(localStorage.getItem("userInfo"));
//     if (user) {
//       setIsLoggedIn(true);
//       // Assuming this login is only for admin for now
//       setIsAdmin(true);
//     } else {
//       setIsLoggedIn(false);
//       setIsAdmin(false);
//     }
//   }, []);

//   const handleLogout = () => {
//     localStorage.removeItem("userInfo");
//     setIsLoggedIn(false);
//     setIsAdmin(false);
//     navigate("/login");
//   };

//   return (
//     <nav className="bg-[#a96a3f] text-white p-3 flex justify-between items-center">
//       <h1 className="text-lg font-semibold">FYP Management</h1>

//       <div className="flex items-center space-x-4">
//         <Link to="/" className="hover:underline">Home</Link>

//         {isLoggedIn && isAdmin && (
//           <>
//             <Link to="/admin-dashboard" className="hover:underline">Admin Dashboard</Link>
//             <Link to="/manage-students" className="hover:underline">Manage Students</Link>
//             <Link to="/manage-teachers" className="hover:underline">Manage Teachers</Link>
//             <Link to="/admin-profile" className="hover:underline">Profile</Link>
//           </>
//         )}

//         {!isLoggedIn ? (
//           <Link to="/login" className="bg-white text-[#a96a3f] px-3 py-1 rounded hover:opacity-90">
//             Login
//           </Link>
//         ) : (
//           <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded hover:opacity-90">
//             Logout
//           </button>
//         )}
//       </div>
//     </nav>
//   );
// }

// export default Navbar;

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    
    // ✅ Updated logic to check role
    if (user && user.token) {
      setIsLoggedIn(true);
      if (user.role === 'admin') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } else {
      setIsLoggedIn(false);
      setIsAdmin(false);
    }
    // We only need to run this once on load
  }, []); 

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    setIsLoggedIn(false);
    setIsAdmin(false);
    navigate("/login");
  };

  return (
    <nav className="bg-[#a96a3f] text-white p-3 flex justify-between items-center">
      <h1 className="text-lg font-semibold">FYP Management</h1>

      <div className="flex items-center space-x-4">
        <Link to="/" className="hover:underline">Home</Link>

        {isLoggedIn && isAdmin && (
          <>
            <Link to="/admin-dashboard" className="hover:underline">Dashboard</Link>
            <Link to="/manage-students" className="hover:underline">Students</Link>
            <Link to="/manage-teachers" className="hover:underline">Teachers</Link>
            
            {/* ✅ ADDED THIS LINK */}
            <Link to="/manage-past-projects" className="hover:underline">Past Projects</Link>
            
            <Link to="/admin-profile" className="hover:underline">Profile</Link>
          </>
        )}

        {/* You can add (isLoggedIn && !isAdmin) links here later for students/teachers */}

        {!isLoggedIn ? (
          <Link to="/login" className="bg-white text-[#a96a3f] px-3 py-1 rounded hover:opacity-90">
            Login
          </Link>
        ) : (
          <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded hover:opacity-90">
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;