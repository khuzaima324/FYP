// // import { useEffect, useState } from "react";
// // import { Link, useNavigate } from "react-router-dom";

// // function Navbar() {
// //   const [isLoggedIn, setIsLoggedIn] = useState(false);
// //   const [isAdmin, setIsAdmin] = useState(false);
// //   const navigate = useNavigate();

// //   useEffect(() => {
// //     const user = JSON.parse(localStorage.getItem("userInfo"));
    
// //     // ✅ Updated logic to check role
// //     if (user && user.token) {
// //       setIsLoggedIn(true);
// //       if (user.role === 'admin') {
// //         setIsAdmin(true);
// //       } else {
// //         setIsAdmin(false);
// //       }
// //     } else {
// //       setIsLoggedIn(false);
// //       setIsAdmin(false);
// //     }
// //     // We only need to run this once on load
// //   }, []); 

// //   const handleLogout = () => {
// //     localStorage.removeItem("userInfo");
// //     setIsLoggedIn(false);
// //     setIsAdmin(false);
// //     navigate("/login");
// //   };

// //   return (
// //     <nav className="bg-[#a96a3f] text-white p-3 flex justify-between items-center">
// //       <h1 className="text-lg font-semibold">FYP Management</h1>

// //       <div className="flex items-center space-x-4">
// //         <Link to="/" className="hover:underline">Home</Link>

// //         {isLoggedIn && isAdmin && (
// //           <>
// //             <Link to="/admin-dashboard" className="hover:underline">Dashboard</Link>
// //             <Link to="/manage-students" className="hover:underline">Students</Link>
// //             <Link to="/manage-teachers" className="hover:underline">Teachers</Link>
// //             <Link to="/manage-past-projects" className="hover:underline">Past Projects</Link>
// //             <Link to="/manage-formats" className="hover:underline">Formats</Link>
// //             <Link to="/admin-profile" className="hover:underline">Profile</Link>
// //           </>
// //         )}

// //         {/* You can add (isLoggedIn && !isAdmin) links here later for students/teachers */}

// //         {!isLoggedIn ? (
// //           <Link to="/login" className="bg-white text-[#a96a3f] px-3 py-1 rounded hover:opacity-90">
// //             Login
// //           </Link>
// //         ) : (
// //           <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded hover:opacity-90">
// //             Logout
// //           </button>
// //         )}
// //       </div>
// //     </nav>
// //   );
// // }

// // export default Navbar;
// import { useEffect, useState } from "react";
// import { Link, useNavigate, useLocation } from "react-router-dom"; // ✅ 1. Import useLocation

// function Navbar() {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [isAdmin, setIsAdmin] = useState(false);
//   const navigate = useNavigate();
//   const location = useLocation(); // ✅ 2. Get the current location

//   useEffect(() => {
//     const user = JSON.parse(localStorage.getItem("userInfo"));
    
//     if (user && user.token) {
//       setIsLoggedIn(true);
//       if (user.role === 'admin') {
//         setIsAdmin(true);
//       } else {
//         setIsAdmin(false);
//       }
//     } else {
//       setIsLoggedIn(false);
//       setIsAdmin(false);
//     }
//   }, [location]); // ✅ 3. Add location as a dependency

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
//             <Link to="/admin-dashboard" className="hover:underline">Dashboard</Link>
//             <Link to="/manage-students" className="hover:underline">Students</Link>
//             <Link to="/manage-teachers" className="hover:underline">Teachers</Link>
//             <Link to="/manage-past-projects" className="hover:underline">Past Projects</Link>
//             <Link to="/manage-formats" className="hover:underline">Formats</Link>
//             <Link to="/admin-profile" className="hover:underline">Profile</Link>
//           </>
//         )}

//         {/* You can add (isLoggedIn && !isAdmin) links here later for students/teachers */}

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
import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null); // Use role state instead of isAdmin
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));

    if (user && user.token) {
      setIsLoggedIn(true);
      setRole(user.role); // Set the role (e.g., "admin", "student")
    } else {
      setIsLoggedIn(false);
      setRole(null);
    }
  }, [location]); // Re-check on every page navigation

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    setIsLoggedIn(false);
    setRole(null); // Clear the role
    navigate("/login");
  };

  return (
    <nav className="bg-[#a96a3f] text-white p-3 flex justify-between items-center">
      <h1 className="text-lg font-semibold">FYP Management</h1>

      <div className="flex items-center space-x-4">
        <Link to="/" className="hover:underline">Home</Link>

        {/* --- Admin Links --- */}
        {isLoggedIn && role === 'admin' && (
          <>
            <Link to="/admin-dashboard" className="hover:underline">Dashboard</Link>
            <Link to="/manage-students" className="hover:underline">Students</Link>
            <Link to="/manage-teachers" className="hover:underline">Teachers</Link>
            <Link to="/manage-past-projects" className="hover:underline">Past Projects</Link>
            <Link to="/manage-formats" className="hover:underline">Formats</Link>
            <Link to="/admin-profile" className="hover:underline">Profile</Link>
          </>
        )}

        {/* --- Student Links --- */}
        {isLoggedIn && role === 'student' && (
          <>
            <Link to="/student-dashboard" className="hover:underline">Dashboard</Link>
            <Link to="/projects" className="hover:underline">Browse Projects</Link>
            <Link to="/past-projects" className="hover:underline">Past Projects</Link>
            <Link to="/document-formats" className="hover:underline">Formats</Link>
            <Link to="/student-profile" className="hover:underline">Profile</Link>
          </>
        )}
        
        {/* --- Teacher Links (Future) --- */}
        {isLoggedIn && role === 'teacher' && (
          <>
            {/* Add teacher-specific links here, e.g., /teacher-dashboard */}
          </>
        )}


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